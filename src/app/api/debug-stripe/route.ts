import { NextResponse } from 'next/server';

export const maxDuration = 30; // Allow up to 30 seconds for this route

export async function GET() {
  const startTime = Date.now();

  const stripeCheck = {
    STRIPE_SECRET_KEY: {
      exists: !!process.env.STRIPE_SECRET_KEY,
      startsWithSk: process.env.STRIPE_SECRET_KEY?.startsWith('sk_') || false,
      length: process.env.STRIPE_SECRET_KEY?.length || 0,
      // Show first 15 chars for debugging (safe since it's just the prefix)
      prefix: process.env.STRIPE_SECRET_KEY?.substring(0, 15) || 'not set',
    },
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: {
      exists: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      startsWithPk: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.startsWith('pk_') || false,
      length: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.length || 0,
    },
    STRIPE_WEBHOOK_SECRET: {
      exists: !!process.env.STRIPE_WEBHOOK_SECRET,
      startsWithWhsec: process.env.STRIPE_WEBHOOK_SECRET?.startsWith('whsec_') || false,
      length: process.env.STRIPE_WEBHOOK_SECRET?.length || 0,
    },
    NEXT_PUBLIC_APP_URL: {
      exists: !!process.env.NEXT_PUBLIC_APP_URL,
      value: process.env.NEXT_PUBLIC_APP_URL || 'not set',
    },
  };

  // Test Stripe connection
  let stripeTest: { success: boolean; error?: string; mode?: string; durationMs?: number } = { success: false };

  try {
    if (process.env.STRIPE_SECRET_KEY) {
      const Stripe = (await import('stripe')).default;
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
        timeout: 20000, // 20 second timeout
        maxNetworkRetries: 3,
      });

      // Try to list 1 product to verify connection
      const products = await stripe.products.list({ limit: 1 });
      const mode = process.env.STRIPE_SECRET_KEY.startsWith('sk_live_') ? 'live' : 'test';
      stripeTest = {
        success: true,
        mode,
        durationMs: Date.now() - startTime,
      };
    } else {
      stripeTest = { success: false, error: 'STRIPE_SECRET_KEY not set' };
    }
  } catch (err) {
    const error = err instanceof Error ? err : new Error('Unknown error');
    stripeTest = {
      success: false,
      error: error.message,
      durationMs: Date.now() - startTime,
    };

    // Log detailed error for debugging
    console.error('Stripe connection error:', {
      message: error.message,
      name: error.name,
      stack: error.stack?.split('\n').slice(0, 5),
    });
  }

  return NextResponse.json({ ...stripeCheck, stripeTest });
}
