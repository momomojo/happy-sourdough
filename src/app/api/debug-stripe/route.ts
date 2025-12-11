import { NextResponse } from 'next/server';

export const maxDuration = 30;

export async function GET() {
  const startTime = Date.now();

  const stripeCheck = {
    STRIPE_SECRET_KEY: {
      exists: !!process.env.STRIPE_SECRET_KEY,
      startsWithSk: process.env.STRIPE_SECRET_KEY?.startsWith('sk_') || false,
      length: process.env.STRIPE_SECRET_KEY?.length || 0,
      prefix: process.env.STRIPE_SECRET_KEY?.substring(0, 20) || 'not set',
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

  // Test Stripe connection using raw fetch
  let stripeTest: { success: boolean; error?: string; mode?: string; durationMs?: number; rawResponse?: unknown } = { success: false };

  try {
    if (process.env.STRIPE_SECRET_KEY) {
      const key = process.env.STRIPE_SECRET_KEY;

      // Use raw fetch to test Stripe API
      const response = await fetch('https://api.stripe.com/v1/products?limit=1', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const data = await response.json();

      if (response.ok) {
        const mode = key.startsWith('sk_live_') ? 'live' : 'test';
        stripeTest = {
          success: true,
          mode,
          durationMs: Date.now() - startTime,
        };
      } else {
        stripeTest = {
          success: false,
          error: data.error?.message || 'Unknown error',
          durationMs: Date.now() - startTime,
          rawResponse: data,
        };
      }
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
  }

  return NextResponse.json({ ...stripeCheck, stripeTest });
}
