import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  typescript: true,
});

/**
 * Create a Stripe Checkout session for an order
 */
export async function createCheckoutSession({
  orderId,
  lineItems,
  customerEmail,
  successUrl,
  cancelUrl,
}: {
  orderId: string;
  lineItems: Stripe.Checkout.SessionCreateParams.LineItem[];
  customerEmail?: string;
  successUrl: string;
  cancelUrl: string;
}) {
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: lineItems,
    customer_email: customerEmail,
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      order_id: orderId,
    },
  });

  return session;
}

/**
 * Retrieve a checkout session by ID
 */
export async function getCheckoutSession(sessionId: string) {
  return stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['payment_intent'],
  });
}

/**
 * Create a refund for a payment intent
 */
export async function createRefund({
  paymentIntentId,
  amount,
  reason,
}: {
  paymentIntentId: string;
  amount?: number;
  reason?: Stripe.RefundCreateParams.Reason;
}) {
  return stripe.refunds.create({
    payment_intent: paymentIntentId,
    amount, // If undefined, refunds full amount
    reason,
  });
}

/**
 * Verify Stripe webhook signature
 */
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string
): Stripe.Event {
  return stripe.webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  );
}
