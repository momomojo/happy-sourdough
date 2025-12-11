import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { verifyWebhookSignature } from '@/lib/stripe/server';
import { createClient } from '@supabase/supabase-js';
import { sendOrderConfirmationEmail } from '@/lib/email/send';

// Create a Supabase client with service role for webhook operations
// This bypasses RLS as webhooks don't have user context
// Using untyped client for flexibility
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
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
    console.error('Webhook signature verification failed:', err);
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
        console.log('PaymentIntent succeeded:', paymentIntent.id);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.error('PaymentIntent failed:', paymentIntent.id);
        await handlePaymentFailed(paymentIntent);
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        await handleChargeRefunded(charge);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('Error processing webhook:', err);
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
    console.error('No order_id in session metadata');
    return;
  }

  console.log(`Processing checkout.session.completed for order: ${orderId}`);

  // Fetch order to get discount_code_id
  const { data: order, error: fetchError } = await supabaseAdmin
    .from('orders')
    .select('discount_code_id')
    .eq('id', orderId)
    .single();

  if (fetchError) {
    console.error('Error fetching order:', fetchError);
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
    console.error('Error updating order:', updateError);
    throw updateError;
  }

  // Increment discount code usage count atomically if discount was used
  if (order.discount_code_id) {
    const { error: discountError } = await supabaseAdmin.rpc('increment_discount_usage', {
      discount_code_id: order.discount_code_id,
    });

    if (discountError) {
      console.error('Error incrementing discount code usage:', discountError);
      // Don't throw - discount tracking failure shouldn't block order confirmation
    } else {
      console.log(`Incremented usage count for discount code: ${order.discount_code_id}`);
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
    console.error('Error creating status history:', historyError);
  }

  console.log(`Order ${orderId} confirmed and payment recorded`);

  // Send confirmation email
  try {
    // Fetch order details
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      console.error('Error fetching order for email:', orderError);
      return;
    }

    // Get customer email - either from guest_email or from auth user
    let customerEmail: string | undefined;
    let customerName = 'Customer';

    if (order.guest_email) {
      customerEmail = order.guest_email;
    } else if (order.user_id) {
      // Get user from auth
      const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(order.user_id);
      customerEmail = authUser?.user?.email;

      // Try to get profile name
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
      console.error('No email found for order');
      return;
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
      console.error('Error fetching order items:', itemsError);
      return;
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

    console.log(`Confirmation email sent for order ${order.order_number}`);
  } catch (emailError) {
    // Don't fail the webhook if email fails
    console.error('Error sending confirmation email:', emailError);
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
    console.error('Could not find order for failed payment intent:', paymentIntent.id);
    return;
  }

  const order = orders[0];

  console.log(`Payment failed for order: ${order.order_number}`);

  // Release time slot if one was reserved
  if (order.time_slot_id) {
    const { error: releaseError } = await supabaseAdmin.rpc('decrement_slot_orders', {
      slot_id: order.time_slot_id,
    });

    if (releaseError) {
      console.error('Error releasing time slot:', releaseError);
    } else {
      console.log(`Released time slot ${order.time_slot_id} for failed order ${order.order_number}`);
    }
  }

  // Update order payment status
  await supabaseAdmin
    .from('orders')
    .update({ payment_status: 'failed' })
    .eq('id', order.id);

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
    console.error('Error creating status history for failed payment:', historyError);
  }
}

/**
 * Handle charge refund
 */
async function handleChargeRefunded(charge: Stripe.Charge) {
  const paymentIntentId = charge.payment_intent as string;

  if (!paymentIntentId) {
    console.error('No payment_intent in charge');
    return;
  }

  // Find order by payment intent
  const { data: orders, error: findError } = await supabaseAdmin
    .from('orders')
    .select('id, order_number, status')
    .eq('stripe_payment_intent_id', paymentIntentId);

  if (findError || !orders || orders.length === 0) {
    console.error('Could not find order for refunded charge:', paymentIntentId);
    return;
  }

  const order = orders[0];

  console.log(`Processing refund for order: ${order.order_number}`);

  // Update order status to refunded
  const { error: updateError } = await supabaseAdmin
    .from('orders')
    .update({
      status: 'refunded',
      payment_status: 'refunded',
    })
    .eq('id', order.id);

  if (updateError) {
    console.error('Error updating order to refunded:', updateError);
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
    console.error('Error creating status history for refund:', historyError);
  }

  console.log(`Order ${order.order_number} marked as refunded`);
}

/**
 * Handle expired checkout session
 * Releases time slot when customer abandons checkout
 */
async function handleCheckoutSessionExpired(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.order_id;

  if (!orderId) {
    console.error('No order_id in expired session metadata');
    return;
  }

  console.log(`Processing checkout.session.expired for order: ${orderId}`);

  // Fetch order to get time_slot_id
  const { data: order, error: fetchError } = await supabaseAdmin
    .from('orders')
    .select('id, order_number, time_slot_id, payment_status')
    .eq('id', orderId)
    .single();

  if (fetchError || !order) {
    console.error('Error fetching order for expired session:', fetchError);
    return;
  }

  // Only process if payment is still pending (not already paid or failed)
  if (order.payment_status !== 'pending') {
    console.log(`Order ${order.order_number} already has status ${order.payment_status}, skipping`);
    return;
  }

  // Release time slot if one was reserved
  if (order.time_slot_id) {
    const { error: releaseError } = await supabaseAdmin.rpc('decrement_slot_orders', {
      slot_id: order.time_slot_id,
    });

    if (releaseError) {
      console.error('Error releasing time slot:', releaseError);
    } else {
      console.log(`Released time slot ${order.time_slot_id} for expired session ${order.order_number}`);
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
    console.error('Error updating order for expired session:', updateError);
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
    console.error('Error creating status history for expired session:', historyError);
  }

  console.log(`Order ${order.order_number} cancelled due to expired session`);
}
