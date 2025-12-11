import Stripe from 'stripe';

// Custom HTTP client using fetch for Vercel serverless compatibility
class FetchHttpClient implements Stripe.HttpClient {
  getClientName(): string {
    return 'fetch';
  }

  async makeRequest(
    host: string,
    port: string,
    path: string,
    method: string,
    headers: Record<string, string>,
    requestData: string | null,
    protocol: string,
    timeout: number
  ): Promise<Stripe.HttpClientResponse> {
    const url = `${protocol}://${host}${port ? `:${port}` : ''}${path}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: requestData || undefined,
        signal: controller.signal,
      });

      const responseText = await response.text();

      return {
        getStatusCode: () => response.status,
        getHeaders: () => {
          const headersObj: Record<string, string> = {};
          response.headers.forEach((value, key) => {
            headersObj[key.toLowerCase()] = value;
          });
          return headersObj;
        },
        getRawResponse: () => response,
        toStream: () => {
          throw new Error('Streaming not supported');
        },
        toJSON: () => {
          try {
            return JSON.parse(responseText);
          } catch {
            return null;
          }
        },
      };
    } finally {
      clearTimeout(timeoutId);
    }
  }
}

// Create a fresh Stripe client for each request to avoid cold start issues on serverless
function createStripeClient(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }

  return new Stripe(key, {
    // Use shorter timeout for serverless environment
    timeout: 20000,
    maxNetworkRetries: 3,
    telemetry: false, // Disable telemetry to reduce overhead
    httpClient: new FetchHttpClient(),
  });
}

// Export for use in API routes - creates fresh client each time
export function getStripeClient(): Stripe {
  return createStripeClient();
}

// Legacy export for backwards compatibility (still creates fresh instances)
export const stripe = createStripeClient();

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
  // Use fresh client for each request
  const client = getStripeClient();
  const session = await client.checkout.sessions.create({
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
  const client = getStripeClient();
  return client.checkout.sessions.retrieve(sessionId, {
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
  const client = getStripeClient();
  return client.refunds.create({
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
  const client = getStripeClient();
  return client.webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  );
}
