import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import * as Sentry from '@sentry/nextjs';
import Stripe from 'stripe';
import { verifyWebhookSignature } from '@/lib/stripe/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { sendOrderConfirmationEmail } from '@/lib/email/send';
import type { Database, Order } from '@/types/database';

// Lazy initialization of Supabase admin client to avoid module-level env var access
// This is necessary for CI builds that use placeholder env vars
let _supabaseAdmin: SupabaseClient<Database> | null = null;

function getSupabaseAdmin(): SupabaseClient<Database> {
  if (!_supabaseAdmin) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
      throw new Error('Missing Supabase environment variables');
    }

    _supabaseAdmin = createClient<Database>(url, key);
  }
  return _supabaseAdmin;
}

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
  const { data: orderData, error: fetchError } = await getSupabaseAdmin()
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

  const order = orderData as { discount_code_id: string | null };

  // Update order with payment information
  const { error: updateError } = await getSupabaseAdmin()
    .from('orders')
    .update({
      stripe_payment_intent_id: session.payment_intent as string,
      payment_status: 'paid',
      status: 'confirmed',
      confirmed_at: new Date().toISOString(),
    } as never)
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
    const { error: discountError } = await (getSupabaseAdmin() as ReturnType<typeof getSupabaseAdmin>).rpc('increment_discount_usage' as never, {
      discount_code_id: order.discount_code_id,
    } as never);

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
  const { error: historyError } = await getSupabaseAdmin()
    .from('order_status_history')
    .insert({
      order_id: orderId,
      status: 'confirmed',
      notes: 'Payment confirmed via Stripe',
      changed_by: null,
    } as never);

  if (historyError) {
    Sentry.captureException(historyError, {
      level: 'warning',
      tags: { webhook: 'stripe', step: 'status_history' },
      extra: { orderId },
    });
  }

  // Decrement inventory for confirmed order
  const { error: inventoryError } = await (getSupabaseAdmin() as ReturnType<typeof getSupabaseAdmin>).rpc('decrement_inventory_for_order' as never, {
    order_id_param: orderId,
  } as never);

  if (inventoryError) {
    Sentry.captureException(inventoryError, {
      level: 'warning',
      tags: { webhook: 'stripe', step: 'decrement_inventory' },
      extra: { orderId },
    });
    // Don't throw - inventory tracking failure shouldn't block order confirmation
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
  const { data: orders, error: findError } = await getSupabaseAdmin()
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

  const order = orders[0] as { id: string; order_number: string; time_slot_id: string | null };

  Sentry.addBreadcrumb({
    message: `Payment failed for order: ${order.order_number}`,
    category: 'stripe',
    level: 'warning',
  });

  // Release time slot if one was reserved
  if (order.time_slot_id) {
    const { error: releaseError } = await (getSupabaseAdmin() as ReturnType<typeof getSupabaseAdmin>).rpc('decrement_slot_orders' as never, {
      slot_id: order.time_slot_id,
    } as never);

    if (releaseError) {
      Sentry.captureException(releaseError, {
        level: 'warning',
        tags: { webhook: 'stripe', step: 'release_slot' },
        extra: { orderId: order.id, timeSlotId: order.time_slot_id },
      });
    }
  }

  // Update order payment status
  const { error: updateError } = await getSupabaseAdmin()
    .from('orders')
    .update({ payment_status: 'failed' } as never)
    .eq('id', order.id);

  if (updateError) {
    Sentry.captureException(updateError, {
      tags: { webhook: 'stripe', step: 'update_failed_order' },
      extra: { orderId: order.id },
    });
  }

  // Add status history entry
  const { error: historyError } = await getSupabaseAdmin()
    .from('order_status_history')
    .insert({
      order_id: order.id,
      status: 'cancelled',
      notes: 'Payment failed - time slot released',
      changed_by: null,
    } as never);

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
  const { data: orders, error: findError } = await getSupabaseAdmin()
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

  const order = orders[0] as { id: string; order_number: string; status: string };

  Sentry.addBreadcrumb({
    message: `Processing refund for order: ${order.order_number}`,
    category: 'stripe',
    level: 'info',
  });

  // Update order status to refunded
  const { error: updateError } = await getSupabaseAdmin()
    .from('orders')
    .update({
      status: 'refunded',
      payment_status: 'refunded',
    } as never)
    .eq('id', order.id);

  if (updateError) {
    Sentry.captureException(updateError, {
      tags: { webhook: 'stripe', step: 'update_refunded' },
      extra: { orderId: order.id },
    });
    return;
  }

  // Restore inventory for refunded order
  const { error: inventoryError } = await (getSupabaseAdmin() as ReturnType<typeof getSupabaseAdmin>).rpc('restore_inventory_for_order' as never, {
    order_id_param: order.id,
  } as never);

  if (inventoryError) {
    Sentry.captureException(inventoryError, {
      level: 'warning',
      tags: { webhook: 'stripe', step: 'restore_inventory' },
      extra: { orderId: order.id },
    });
    // Don't throw - inventory restoration failure shouldn't block refund processing
  }

  // Add status history entry
  const { error: historyError } = await getSupabaseAdmin()
    .from('order_status_history')
    .insert({
      order_id: order.id,
      status: 'refunded',
      notes: `Refund processed: ${charge.amount_refunded / 100} ${charge.currency.toUpperCase()}`,
      changed_by: null,
    } as never);

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
  const { data: orderData, error: fetchError } = await getSupabaseAdmin()
    .from('orders')
    .select('id, order_number, time_slot_id, payment_status')
    .eq('id', orderId)
    .single();

  if (fetchError || !orderData) {
    Sentry.captureException(fetchError, {
      level: 'warning',
      tags: { webhook: 'stripe', step: 'fetch_expired_order' },
      extra: { orderId },
    });
    return;
  }

  const order = orderData as { id: string; order_number: string; time_slot_id: string | null; payment_status: string };

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
    const { error: releaseError } = await (getSupabaseAdmin() as ReturnType<typeof getSupabaseAdmin>).rpc('decrement_slot_orders' as never, {
      slot_id: order.time_slot_id,
    } as never);

    if (releaseError) {
      Sentry.captureException(releaseError, {
        level: 'warning',
        tags: { webhook: 'stripe', step: 'release_slot_expired' },
        extra: { orderId: order.id, timeSlotId: order.time_slot_id },
      });
    }
  }

  // Update order status
  const { error: updateError } = await getSupabaseAdmin()
    .from('orders')
    .update({
      status: 'cancelled',
      payment_status: 'failed',
    } as never)
    .eq('id', order.id);

  if (updateError) {
    Sentry.captureException(updateError, {
      tags: { webhook: 'stripe', step: 'update_expired' },
      extra: { orderId: order.id },
    });
    return;
  }

  // Add status history entry
  const { error: historyError } = await getSupabaseAdmin()
    .from('order_status_history')
    .insert({
      order_id: order.id,
      status: 'cancelled',
      notes: 'Checkout session expired - time slot released',
      changed_by: null,
    } as never);

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
  const { data: orderData, error: orderError } = await getSupabaseAdmin()
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();

  if (orderError || !orderData) {
    throw new Error(`Failed to fetch order: ${orderError?.message}`);
  }

  const order = orderData as Order;

  // Get customer email
  let customerEmail: string | undefined;
  let customerName = 'Customer';

  if (order.guest_email) {
    customerEmail = order.guest_email;
  } else if (order.user_id) {
    const { data: authUser } = await getSupabaseAdmin().auth.admin.getUserById(order.user_id);
    customerEmail = authUser?.user?.email;

    const { data: profileData } = await getSupabaseAdmin()
      .from('customer_profiles')
      .select('first_name, last_name')
      .eq('id', order.user_id)
      .single();

    const profile = profileData as { first_name: string | null; last_name: string | null } | null;
    if (profile) {
      customerName = [profile.first_name, profile.last_name].filter(Boolean).join(' ') || 'Customer';
    }
  }

  if (!customerEmail) {
    throw new Error('No email found for order');
  }

  // Get order items
  const { data: orderItems, error: itemsError } = await getSupabaseAdmin()
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
    const { data: slotData } = await getSupabaseAdmin()
      .from('time_slots')
      .select('date, window_start, window_end')
      .eq('id', order.time_slot_id)
      .single();

    const slot = slotData as { date: string; window_start: string; window_end: string } | null;
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

  // Format delivery address as string for email
  let deliveryAddressStr: string | undefined;
  if (order.delivery_address) {
    const addr = order.delivery_address as { street?: string; apt?: string; city?: string; state?: string; zip?: string };
    deliveryAddressStr = [
      addr.street,
      addr.apt,
      addr.city,
      addr.state,
      addr.zip
    ].filter(Boolean).join(', ');
  }

  // Send email
  await sendOrderConfirmationEmail({
    orderNumber: order.order_number,
    customerName,
    customerEmail,
    items: emailItems,
    subtotal: order.subtotal,
    deliveryFee: order.delivery_fee ?? 0,
    tax: order.tax_amount ?? 0,
    total: order.total,
    deliveryType: order.fulfillment_type as 'pickup' | 'delivery',
    deliveryAddress: deliveryAddressStr,
    timeSlot,
  });
}
