import { NextResponse } from 'next/server';

export async function GET() {
  const stripeCheck = {
    STRIPE_SECRET_KEY: {
      exists: !!process.env.STRIPE_SECRET_KEY,
      startsWithSk: process.env.STRIPE_SECRET_KEY?.startsWith('sk_') || false,
      length: process.env.STRIPE_SECRET_KEY?.length || 0,
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
  let stripeTest: { success: boolean; error?: string; mode?: string } = { success: false };

  try {
    if (process.env.STRIPE_SECRET_KEY) {
      const Stripe = (await import('stripe')).default;
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
        typescript: true,
      });

      // Try to list 1 product to verify connection
      const products = await stripe.products.list({ limit: 1 });
      const mode = process.env.STRIPE_SECRET_KEY.startsWith('sk_live_') ? 'live' : 'test';
      stripeTest = { success: true, mode };
    } else {
      stripeTest = { success: false, error: 'STRIPE_SECRET_KEY not set' };
    }
  } catch (err) {
    stripeTest = { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }

  return NextResponse.json({ ...stripeCheck, stripeTest });
}
