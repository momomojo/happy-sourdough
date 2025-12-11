import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import * as Sentry from '@sentry/nextjs';
import Stripe from 'stripe';
import { verifyWebhookSignature } from '@/lib/stripe/server';
import { createClient } from '@supabase/supabase-js';
import { sendOrderConfirmationEmail } from '@/lib/email/send';

// Create a Supabase client with service role for webhook operations
// This bypasses RLS as webhooks don't have user context
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    Sentry.captureMessage('Missing stripe-signature header', {
      level: 'warning',
      tags: { webhook: 'stripe' },
    });
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    // Verify the webhook signature
    event = verifyWebhookSignature(body, signature);
  } catch (err) {
    Sentry.captureException(err, {
      tags: { webhook: 'stripe', step: 'signature_verification' },
    });
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutSessionCompleted(session);
        break;
      }

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutSessionExpired(session);
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        Sentry.addBreadcrumb({
          message: `PaymentIntent succeeded: ${paymentIntent.id}`,
          category: 'stripe',
          level: 'info',
        });
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentFailed(paymentIntent);
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        await handleChargeRefunded(charge);
        break;
      }

      default:
        Sentry.addBreadcrumb({
          message: `Unhandled event type: ${event.type}`,
          category: 'stripe',
          level: 'info',
        });
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    Sentry.captureException(err, {
      tags: { webhook: 'stripe', event_type: event.type },
      extra: { event_id: event.id },
    });
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

/**
 * Handle successful checkout session completion
 * Updates order status and payment status, sends confirmation email
 */
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.order_id;

  if (!orderId) {
    Sentry.captureMessage('No order_id in checkout session metadata', {
      level: 'error',
      tags: { webhook: 'stripe', step: 'checkout_completed' },
      extra: { sessionId: session.id },
    });
    return;
  }

  Sentry.addBreadcrumb({
    message: `Processing checkout.session.completed for order: ${orderId}`,
    category: 'stripe',
    level: 'info',
  });

  // Fetch order to get discount_code_id
  const { data: order, error: fetchError } = await supabaseAdmin
    .from('orders')
    .select('discount_code_id')
    .eq('id', orderId)
    .single();

  if (fetchError) {
    Sentry.captureException(fetchError, {
      tags: { webhook: 'stripe', step: 'fetch_order' },
      extra: { orderId },
    });
    throw fetchError;
  }

  // Update order with payment information
  const { error: updateError } = await supabaseAdmin
    .from('orders')
    .update({
      stripe_payment_intent_id: session.payment_intent as string,
      payment_status: 'paid',
      status: 'confirmed',
      confirmed_at: new Date().toISOString(),
    })
    .eq('id', orderId);

  if (updateError) {
    Sentry.captureException(updateError, {
      tags: { webhook: 'stripe', step: 'update_order' },
      extra: { orderId },
    });
    throw updateError;
  }

  // Increment discount code usage count atomically if discount was used
  if (order.discount_code_id) {
    const { error: discountError } = await supabaseAdmin.rpc('increment_discount_usage', {
      discount_code_id: order.discount_code_id,
    });

    if (discountError) {
      Sentry.captureException(discountError, {
        level: 'warning',
        tags: { webhook: 'stripe', step: 'increment_discount' },
        extra: { orderId, discountCodeId: order.discount_code_id },
      });
      // Don't throw - discount tracking failure shouldn't block order confirmation
    }
  }

  // Add status history entry
  const { error: historyError } = await supabaseAdmin
    .from('order_status_history')
    .insert({
      order_id: orderId,
      status: 'confirmed',
      notes: 'Payment confirmed via Stripe',
      changed_by: null,
    });

  if (historyError) {
    Sentry.captureException(historyError, {
      level: 'warning',
      tags: { webhook: 'stripe', step: 'status_history' },
      extra: { orderId },
    });
  }

  // Send confirmation email
  try {
    await sendConfirmationEmail(orderId);
  } catch (emailError) {
    // Don't fail the webhook if email fails
    Sentry.captureException(emailError, {
      level: 'warning',
      tags: { webhook: 'stripe', step: 'send_email' },
      extra: { orderId },
    });
  }
}

/**
 * Handle failed payment
 * Releases time slot and updates order status
 */
async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  // Find order by payment intent
  const { data: orders, error: findError } = await supabaseAdmin
    .from('orders')
    .select('id, order_number, time_slot_id')
    .eq('stripe_payment_intent_id', paymentIntent.id);

  if (findError || !orders || orders.length === 0) {
    Sentry.captureMessage('Could not find order for failed payment intent', {
      level: 'warning',
      tags: { webhook: 'stripe', step: 'payment_failed' },
      extra: { paymentIntentId: paymentIntent.id },
    });
    return;
  }

  const order = orders[0];

  Sentry.addBreadcrumb({
    message: `Payment failed for order: ${order.order_number}`,
    category: 'stripe',
    level: 'warning',
  });

  // Release time slot if one was reserved
  if (order.time_slot_id) {
    const { error: releaseError } = await supabaseAdmin.rpc('decrement_slot_orders', {
      slot_id: order.time_slot_id,
    });

    if (releaseError) {
      Sentry.captureException(releaseError, {
        level: 'warning',
        tags: { webhook: 'stripe', step: 'release_slot' },
        extra: { orderId: order.id, timeSlotId: order.time_slot_id },
      });
    }
  }

  // Update order payment status
  const { error: updateError } = await supabaseAdmin
    .from('orders')
    .update({ payment_status: 'failed' })
    .eq('id', order.id);

  if (updateError) {
    Sentry.captureException(updateError, {
      tags: { webhook: 'stripe', step: 'update_failed_order' },
      extra: { orderId: order.id },
    });
  }

  // Add status history entry
  const { error: historyError } = await supabaseAdmin
    .from('order_status_history')
    .insert({
      order_id: order.id,
      status: 'cancelled',
      notes: 'Payment failed - time slot released',
      changed_by: null,
    });

  if (historyError) {
    Sentry.captureException(historyError, {
      level: 'warning',
      tags: { webhook: 'stripe', step: 'status_history' },
      extra: { orderId: order.id },
    });
  }
}

/**
 * Handle charge refund
 */
async function handleChargeRefunded(charge: Stripe.Charge) {
  const paymentIntentId = charge.payment_intent as string;

  if (!paymentIntentId) {
    Sentry.captureMessage('No payment_intent in charge', {
      level: 'warning',
      tags: { webhook: 'stripe', step: 'charge_refunded' },
      extra: { chargeId: charge.id },
    });
    return;
  }

  // Find order by payment intent
  const { data: orders, error: findError } = await supabaseAdmin
    .from('orders')
    .select('id, order_number, status')
    .eq('stripe_payment_intent_id', paymentIntentId);

  if (findError || !orders || orders.length === 0) {
    Sentry.captureMessage('Could not find order for refunded charge', {
      level: 'warning',
      tags: { webhook: 'stripe', step: 'charge_refunded' },
      extra: { paymentIntentId },
    });
    return;
  }

  const order = orders[0];

  Sentry.addBreadcrumb({
    message: `Processing refund for order: ${order.order_number}`,
    category: 'stripe',
    level: 'info',
  });

  // Update order status to refunded
  const { error: updateError } = await supabaseAdmin
    .from('orders')
    .update({
      status: 'refunded',
      payment_status: 'refunded',
    })
    .eq('id', order.id);

  if (updateError) {
    Sentry.captureException(updateError, {
      tags: { webhook: 'stripe', step: 'update_refunded' },
      extra: { orderId: order.id },
    });
    return;
  }

  // Add status history entry
  const { error: historyError } = await supabaseAdmin
    .from('order_status_history')
    .insert({
      order_id: order.id,
      status: 'refunded',
      notes: `Refund processed: ${charge.amount_refunded / 100} ${charge.currency.toUpperCase()}`,
      changed_by: null,
    });

  if (historyError) {
    Sentry.captureException(historyError, {
      level: 'warning',
      tags: { webhook: 'stripe', step: 'status_history' },
      extra: { orderId: order.id },
    });
  }
}

/**
 * Handle expired checkout session
 * Releases time slot when customer abandons checkout
 */
async function handleCheckoutSessionExpired(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.order_id;

  if (!orderId) {
    Sentry.captureMessage('No order_id in expired session metadata', {
      level: 'warning',
      tags: { webhook: 'stripe', step: 'session_expired' },
      extra: { sessionId: session.id },
    });
    return;
  }

  Sentry.addBreadcrumb({
    message: `Processing checkout.session.expired for order: ${orderId}`,
    category: 'stripe',
    level: 'info',
  });

  // Fetch order to get time_slot_id
  const { data: order, error: fetchError } = await supabaseAdmin
    .from('orders')
    .select('id, order_number, time_slot_id, payment_status')
    .eq('id', orderId)
    .single();

  if (fetchError || !order) {
    Sentry.captureException(fetchError, {
      level: 'warning',
      tags: { webhook: 'stripe', step: 'fetch_expired_order' },
      extra: { orderId },
    });
    return;
  }

  // Only process if payment is still pending (not already paid or failed)
  if (order.payment_status !== 'pending') {
    Sentry.addBreadcrumb({
      message: `Order ${order.order_number} already has status ${order.payment_status}, skipping`,
      category: 'stripe',
      level: 'info',
    });
    return;
  }

  // Release time slot if one was reserved
  if (order.time_slot_id) {
    const { error: releaseError } = await supabaseAdmin.rpc('decrement_slot_orders', {
      slot_id: order.time_slot_id,
    });

    if (releaseError) {
      Sentry.captureException(releaseError, {
        level: 'warning',
        tags: { webhook: 'stripe', step: 'release_slot_expired' },
        extra: { orderId: order.id, timeSlotId: order.time_slot_id },
      });
    }
  }

  // Update order status
  const { error: updateError } = await supabaseAdmin
    .from('orders')
    .update({
      status: 'cancelled',
      payment_status: 'failed',
    })
    .eq('id', order.id);

  if (updateError) {
    Sentry.captureException(updateError, {
      tags: { webhook: 'stripe', step: 'update_expired' },
      extra: { orderId: order.id },
    });
    return;
  }

  // Add status history entry
  const { error: historyError } = await supabaseAdmin
    .from('order_status_history')
    .insert({
      order_id: order.id,
      status: 'cancelled',
      notes: 'Checkout session expired - time slot released',
      changed_by: null,
    });

  if (historyError) {
    Sentry.captureException(historyError, {
      level: 'warning',
      tags: { webhook: 'stripe', step: 'status_history' },
      extra: { orderId: order.id },
    });
  }
}

/**
 * Helper function to send confirmation email
 */
async function sendConfirmationEmail(orderId: string) {
  // Fetch order details
  const { data: order, error: orderError } = await supabaseAdmin
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();

  if (orderError || !order) {
    throw new Error(`Failed to fetch order: ${orderError?.message}`);
  }

  // Get customer email
  let customerEmail: string | undefined;
  let customerName = 'Customer';

  if (order.guest_email) {
    customerEmail = order.guest_email;
  } else if (order.user_id) {
    const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(order.user_id);
    customerEmail = authUser?.user?.email;

    const { data: profile } = await supabaseAdmin
      .from('customer_profiles')
      .select('first_name, last_name')
      .eq('id', order.user_id)
      .single();

    if (profile) {
      customerName = [profile.first_name, profile.last_name].filter(Boolean).join(' ') || 'Customer';
    }
  }

  if (!customerEmail) {
    throw new Error('No email found for order');
  }

  // Get order items
  const { data: orderItems, error: itemsError } = await supabaseAdmin
    .from('order_items')
    .select(`
      *,
      products(name),
      product_variants(name)
    `)
    .eq('order_id', orderId);

  if (itemsError || !orderItems) {
    throw new Error(`Failed to fetch order items: ${itemsError?.message}`);
  }

  // Get time slot if available
  let timeSlot;
  if (order.time_slot_id) {
    const { data: slot } = await supabaseAdmin
      .from('time_slots')
      .select('date, window_start, window_end')
      .eq('id', order.time_slot_id)
      .single();

    if (slot) {
      timeSlot = {
        date: slot.date,
        windowStart: slot.window_start,
        windowEnd: slot.window_end,
      };
    }
  }

  // Format items for email
  const emailItems = orderItems.map((item: Record<string, unknown>) => ({
    product_name: (item.products as { name: string } | null)?.name || item.product_name as string || 'Unknown Product',
    variant_name: (item.product_variants as { name: string } | null)?.name || item.variant_name as string || null,
    quantity: item.quantity as number,
    unit_price: item.unit_price as number,
    total_price: item.total_price as number,
  }));

  // Send email
  await sendOrderConfirmationEmail({
    orderNumber: order.order_number,
    customerName,
    customerEmail,
    items: emailItems,
    subtotal: order.subtotal,
    deliveryFee: order.delivery_fee,
    tax: order.tax_amount,
    total: order.total,
    deliveryType: order.fulfillment_type,
    deliveryAddress: order.delivery_address || undefined,
    timeSlot,
  });
}
