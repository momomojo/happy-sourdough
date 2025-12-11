import Stripe from 'stripe';
import crypto from 'crypto';

const STRIPE_API_BASE = 'https://api.stripe.com/v1';

// Helper function to make Stripe API calls using fetch (bypasses SDK issues on Vercel)
async function stripeApiCall<T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'DELETE' = 'GET',
  body?: Record<string, unknown>
): Promise<T> {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }

  const headers: Record<string, string> = {
    'Authorization': `Bearer ${key}`,
    'Content-Type': 'application/x-www-form-urlencoded',
  };

  const options: RequestInit = {
    method,
    headers,
  };

  if (body && method === 'POST') {
    // Convert nested objects to Stripe's bracket notation
    const formData = new URLSearchParams();

    function addToFormData(obj: Record<string, unknown>, prefix = '') {
      for (const [key, value] of Object.entries(obj)) {
        const fullKey = prefix ? `${prefix}[${key}]` : key;

        if (Array.isArray(value)) {
          value.forEach((item, index) => {
            if (typeof item === 'object' && item !== null) {
              addToFormData(item as Record<string, unknown>, `${fullKey}[${index}]`);
            } else {
              formData.append(`${fullKey}[${index}]`, String(item));
            }
          });
        } else if (typeof value === 'object' && value !== null) {
          addToFormData(value as Record<string, unknown>, fullKey);
        } else if (value !== undefined && value !== null) {
          formData.append(fullKey, String(value));
        }
      }
    }

    addToFormData(body);
    options.body = formData.toString();
  }

  const response = await fetch(`${STRIPE_API_BASE}${endpoint}`, options);
  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.error?.message || 'Stripe API error');
    (error as Error & { type: string; code: string }).type = data.error?.type;
    (error as Error & { type: string; code: string }).code = data.error?.code;
    throw error;
  }

  return data as T;
}

// Type for checkout session response
interface CheckoutSessionResponse {
  id: string;
  url: string;
  payment_intent?: string;
  metadata: Record<string, string>;
}

/**
 * Create a Stripe Checkout session for an order
 * Uses fetch-based API to work around SDK issues on Vercel serverless
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
  // Build request body for Stripe API
  const body: Record<string, unknown> = {
    mode: 'payment',
    payment_method_types: ['card'],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      order_id: orderId,
    },
  };

  if (customerEmail) {
    body.customer_email = customerEmail;
  }

  // Convert line items to Stripe format
  body.line_items = lineItems.map(item => ({
    price_data: {
      currency: item.price_data?.currency || 'usd',
      unit_amount: item.price_data?.unit_amount,
      product_data: {
        name: item.price_data?.product_data?.name,
        description: item.price_data?.product_data?.description,
        images: item.price_data?.product_data?.images,
      },
    },
    quantity: item.quantity,
  }));

  const session = await stripeApiCall<CheckoutSessionResponse>('/checkout/sessions', 'POST', body);

  return session;
}

/**
 * Retrieve a checkout session by ID
 */
export async function getCheckoutSession(sessionId: string) {
  return stripeApiCall<Stripe.Checkout.Session>(
    `/checkout/sessions/${sessionId}?expand[]=payment_intent`
  );
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
  const body: Record<string, unknown> = {
    payment_intent: paymentIntentId,
  };

  if (amount !== undefined) {
    body.amount = amount;
  }

  if (reason) {
    body.reason = reason;
  }

  return stripeApiCall<Stripe.Refund>('/refunds', 'POST', body);
}

/**
 * Verify Stripe webhook signature
 * This function uses crypto to verify the signature without the SDK
 */
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string
): Stripe.Event {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
  }

  // Parse the signature header
  const elements = signature.split(',');
  const signatureMap: Record<string, string> = {};

  for (const element of elements) {
    const [key, value] = element.split('=');
    signatureMap[key] = value;
  }

  const timestamp = signatureMap['t'];
  const sig = signatureMap['v1'];

  if (!timestamp || !sig) {
    throw new Error('Invalid Stripe signature format');
  }

  // Verify timestamp is not too old (within 5 minutes)
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - parseInt(timestamp, 10)) > 300) {
    throw new Error('Webhook timestamp too old');
  }

  // Compute expected signature
  const payloadString = typeof payload === 'string' ? payload : payload.toString('utf8');
  const signedPayload = `${timestamp}.${payloadString}`;
  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(signedPayload)
    .digest('hex');

  // Compare signatures
  if (sig !== expectedSignature) {
    throw new Error('Invalid Stripe webhook signature');
  }

  // Parse and return the event
  const event = JSON.parse(payloadString) as Stripe.Event;
  return event;
}

// ============================================================================
// Product/Price Management Functions (for admin sync operations)
// ============================================================================

/**
 * Create a Stripe product
 */
export async function createStripeProduct(params: {
  name: string;
  description?: string;
  images?: string[];
  metadata?: Record<string, string>;
}): Promise<Stripe.Product> {
  return stripeApiCall<Stripe.Product>('/products', 'POST', params);
}

/**
 * Update a Stripe product
 */
export async function updateStripeProduct(
  productId: string,
  params: {
    name?: string;
    description?: string;
    images?: string[];
    metadata?: Record<string, string>;
    default_price?: string;
    active?: boolean;
  }
): Promise<Stripe.Product> {
  return stripeApiCall<Stripe.Product>(`/products/${productId}`, 'POST', params);
}

/**
 * Create a Stripe price
 */
export async function createStripePrice(params: {
  product: string;
  unit_amount: number;
  currency: string;
  nickname?: string;
  metadata?: Record<string, string>;
}): Promise<Stripe.Price> {
  return stripeApiCall<Stripe.Price>('/prices', 'POST', params);
}

/**
 * Update a Stripe price
 */
export async function updateStripePrice(
  priceId: string,
  params: {
    active?: boolean;
    metadata?: Record<string, string>;
  }
): Promise<Stripe.Price> {
  return stripeApiCall<Stripe.Price>(`/prices/${priceId}`, 'POST', params);
}

/**
 * Retrieve a Stripe price
 */
export async function retrieveStripePrice(priceId: string): Promise<Stripe.Price> {
  return stripeApiCall<Stripe.Price>(`/prices/${priceId}`);
}

/**
 * List Stripe products
 */
export async function listStripeProducts(params?: {
  active?: boolean;
  limit?: number;
}): Promise<{ data: Stripe.Product[] }> {
  const queryParams = new URLSearchParams();
  if (params?.active !== undefined) queryParams.append('active', String(params.active));
  if (params?.limit) queryParams.append('limit', String(params.limit));
  queryParams.append('expand[]', 'data.default_price');

  const query = queryParams.toString();
  return stripeApiCall<{ data: Stripe.Product[] }>(`/products${query ? `?${query}` : ''}`);
}
