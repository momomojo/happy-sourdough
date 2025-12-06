import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { verifyWebhookSignature } from '@/lib/stripe/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import { sendOrderConfirmationEmail } from '@/lib/email/send';

// Create a Supabase client with service role for webhook operations
// This bypasses RLS as webhooks don't have user context
const supabaseAdmin = createClient<Database>(
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

  // Update order with payment information
  const { error: updateError } = await supabaseAdmin
    .from('orders')
    .update({
      stripe_payment_intent_id: session.payment_intent as string,
      stripe_checkout_session_id: session.id,
      status: 'confirmed',
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId);

  if (updateError) {
    console.error('Error updating order:', updateError);
    throw updateError;
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
    // Fetch order details with customer info and items
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        customer_profiles!inner(full_name, user_id)
      `)
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      console.error('Error fetching order for email:', orderError);
      return;
    }

    // Get customer email from auth
    const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(
      (order as any).customer_profiles.user_id
    );

    if (!authUser?.user?.email) {
      console.error('No email found for user');
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
    const emailItems = orderItems.map((item: any) => ({
      product_name: item.products?.name || 'Unknown Product',
      variant_name: item.product_variants?.name || null,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.total_price,
    }));

    // Send email
    await sendOrderConfirmationEmail({
      orderNumber: order.order_number,
      customerName: (order as any).customer_profiles.full_name || 'Customer',
      customerEmail: authUser.user.email,
      items: emailItems,
      subtotal: order.subtotal,
      deliveryFee: order.delivery_fee,
      tax: order.tax,
      total: order.total,
      deliveryType: order.delivery_type,
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
 */
async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  // Find order by payment intent
  const { data: orders, error: findError } = await supabaseAdmin
    .from('orders')
    .select('id, order_number')
    .eq('stripe_payment_intent_id', paymentIntent.id);

  if (findError || !orders || orders.length === 0) {
    console.error('Could not find order for failed payment intent:', paymentIntent.id);
    return;
  }

  const order = orders[0];

  console.log(`Payment failed for order: ${order.order_number}`);

  // You might want to send an email notification here
  // or update the order status to reflect the payment failure
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
      updated_at: new Date().toISOString(),
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
