import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ArrowRight, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { getCheckoutSession } from '@/lib/stripe/server';
import { createClient } from '@/lib/supabase/server';

interface SearchParams {
  session_id?: string;
  order_id?: string;
}

async function validateCheckoutSession(sessionId: string, orderId: string) {
  try {
    // 1. Verify the Stripe session exists and payment was successful
    const session = await getCheckoutSession(sessionId);

    if (!session) {
      console.error('Stripe session not found:', sessionId);
      return { valid: false, error: 'Payment session not found' };
    }

    if (session.payment_status !== 'paid') {
      console.error('Payment not completed:', session.payment_status);
      return { valid: false, error: 'Payment not completed' };
    }

    // 2. Verify the session belongs to an order in our database
    const supabase = await createClient();

    type OrderVerification = {
      id: string;
      order_number: string;
      stripe_checkout_session_id: string | null;
      payment_status: string;
    };

    const orderResult = await (supabase
      .from('orders') as ReturnType<typeof supabase.from>)
      .select('id, order_number, stripe_checkout_session_id, payment_status')
      .eq('id', orderId)
      .eq('stripe_checkout_session_id', sessionId)
      .single();

    const { data: order, error: orderError } = orderResult as {
      data: OrderVerification | null;
      error: unknown;
    };

    if (orderError || !order) {
      console.error('Order not found or session mismatch:', orderError);
      return { valid: false, error: 'Order verification failed' };
    }

    // 3. Additional check: verify session metadata contains the order_id
    if (session.metadata?.order_id !== orderId) {
      console.error('Session metadata order_id mismatch');
      return { valid: false, error: 'Order verification failed' };
    }

    return {
      valid: true,
      orderNumber: order.order_number,
      error: null
    };

  } catch (error) {
    console.error('Session validation error:', error);
    return {
      valid: false,
      error: 'Failed to validate payment session'
    };
  }
}

async function SuccessContent({ searchParams }: { searchParams: SearchParams }) {
  const sessionId = searchParams.session_id;
  const orderId = searchParams.order_id;

  // Validate required parameters
  if (!sessionId || !orderId) {
    redirect('/checkout?error=missing_session');
  }

  // Validate the Stripe session and order
  const validation = await validateCheckoutSession(sessionId, orderId);

  if (!validation.valid) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <Card className="border-destructive">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <AlertTriangle className="h-16 w-16 text-destructive" />
              </div>
              <CardTitle className="text-3xl">Payment Verification Failed</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <p className="text-muted-foreground">
                We couldn&apos;t verify your payment. {validation.error}
              </p>

              <div className="bg-muted/50 rounded-lg p-6 space-y-2">
                <p className="font-medium">What should you do?</p>
                <ol className="text-sm text-muted-foreground space-y-2 text-left max-w-md mx-auto">
                  <li className="flex gap-2">
                    <span className="font-semibold">1.</span>
                    <span>Check your email for a payment confirmation from Stripe</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-semibold">2.</span>
                    <span>Contact our support team if you were charged</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-semibold">3.</span>
                    <span>Try placing your order again</span>
                  </li>
                </ol>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button asChild>
                  <Link href="/checkout">
                    Try Again
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/products">Continue Shopping</Link>
                </Button>
              </div>

              <p className="text-sm text-muted-foreground pt-4">
                Need help? Contact us at{' '}
                <a href="mailto:hello@happysourdough.com" className="underline">
                  hello@happysourdough.com
                </a>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="h-16 w-16 text-green-600" />
            </div>
            <CardTitle className="text-3xl">Order Confirmed!</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <p className="text-muted-foreground">
              Thank you for your order! We&apos;ve received your payment and our bakers
              are getting ready to prepare your fresh sourdough.
            </p>

            {validation.orderNumber && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm font-medium text-green-900 mb-1">Order Number</p>
                <p className="font-mono text-2xl font-bold text-green-950">
                  {validation.orderNumber}
                </p>
              </div>
            )}

            <div className="bg-muted/50 rounded-lg p-6 space-y-2">
              <p className="font-medium">What happens next?</p>
              <ol className="text-sm text-muted-foreground space-y-2 text-left max-w-md mx-auto">
                <li className="flex gap-2">
                  <span className="font-semibold">1.</span>
                  <span>You&apos;ll receive an order confirmation email shortly</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold">2.</span>
                  <span>We&apos;ll send updates as your order is prepared</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold">3.</span>
                  <span>You&apos;ll get a notification when your order is ready for delivery/pickup</span>
                </li>
              </ol>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              {validation.orderNumber && (
                <Button asChild>
                  <Link href={`/order/${validation.orderNumber}`}>
                    Track Order
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              )}
              <Button variant={validation.orderNumber ? "outline" : "default"} asChild>
                <Link href="/products">
                  Continue Shopping
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/account/orders">View My Orders</Link>
              </Button>
            </div>

            <p className="text-sm text-muted-foreground pt-4">
              Questions? Contact us at{' '}
              <a href="mailto:hello@happysourdough.com" className="underline">
                hello@happysourdough.com
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  // Await searchParams as required by Next.js 15
  const params = await searchParams;

  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex h-16 w-16 animate-spin items-center justify-center rounded-full border-4 border-primary border-t-transparent mb-4" />
          <p className="text-muted-foreground">Verifying your payment...</p>
        </div>
      </div>
    }>
      <SuccessContent searchParams={params} />
    </Suspense>
  );
}
