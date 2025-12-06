'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, Package, ArrowRight, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get order number from URL params
    const sessionId = searchParams.get('session_id');
    const orderNum = searchParams.get('order_number');

    if (orderNum) {
      setOrderNumber(orderNum);
      setIsLoading(false);

      // Clear cart from localStorage after successful checkout
      if (typeof window !== 'undefined') {
        localStorage.removeItem('cart');
        // Dispatch custom event to notify cart components
        window.dispatchEvent(new Event('cart-cleared'));
      }
    } else if (sessionId) {
      // If we have session_id but no order_number, we could fetch it
      // For now, just show a generic success message
      setIsLoading(false);
    } else {
      // No order info, redirect to home after a delay
      setTimeout(() => {
        router.push('/');
      }, 3000);
    }
  }, [searchParams, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-flex h-16 w-16 animate-spin items-center justify-center rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Loading your order details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      {/* Success Animation Area */}
      <div className="mb-8 text-center">
        <div className="mb-6 inline-flex h-24 w-24 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 className="h-14 w-14 text-green-600" />
        </div>
        <h1 className="mb-2 text-3xl font-bold tracking-tight">Order Confirmed!</h1>
        <p className="text-lg text-muted-foreground">
          Thank you for your order. We'll start preparing your fresh baked goods right away.
        </p>
      </div>

      {/* Order Number Card */}
      {orderNumber && (
        <Card className="mb-8 border-2 border-green-200 bg-green-50/50">
          <CardContent className="flex items-center justify-between p-6">
            <div className="flex items-center gap-4">
              <Package className="h-10 w-10 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-900">Your Order Number</p>
                <p className="font-mono text-2xl font-bold text-green-950">{orderNumber}</p>
              </div>
            </div>
            <Button asChild>
              <Link href={`/order/${orderNumber}`}>
                Track Order
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* What's Next Section */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <h2 className="mb-4 text-xl font-semibold">What happens next?</h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                1
              </div>
              <div>
                <h3 className="font-semibold">Order Confirmation</h3>
                <p className="text-sm text-muted-foreground">
                  You'll receive an email confirmation with your order details shortly.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                2
              </div>
              <div>
                <h3 className="font-semibold">We're Baking</h3>
                <p className="text-sm text-muted-foreground">
                  Our bakers will prepare your order fresh using our artisan sourdough recipes.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                3
              </div>
              <div>
                <h3 className="font-semibold">Ready for You</h3>
                <p className="text-sm text-muted-foreground">
                  We'll notify you when your order is ready for pickup or out for delivery.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        {orderNumber && (
          <Button size="lg" asChild>
            <Link href={`/order/${orderNumber}`}>
              <Package className="mr-2 h-5 w-5" />
              Track Your Order
            </Link>
          </Button>
        )}
        <Button size="lg" variant="outline" asChild>
          <Link href="/products">
            Continue Shopping
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </Button>
        <Button size="lg" variant="ghost" asChild>
          <Link href="/">
            <Home className="mr-2 h-5 w-5" />
            Back to Home
          </Link>
        </Button>
      </div>

      {/* Help Section */}
      <div className="mt-12 rounded-lg border bg-muted/50 p-6 text-center">
        <h3 className="mb-2 font-semibold">Need Help?</h3>
        <p className="mb-4 text-sm text-muted-foreground">
          Questions about your order? We're here to help!
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button variant="outline" size="sm" asChild>
            <a href="mailto:orders@happysourdough.com">Email Support</a>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href="tel:+15555551234">Call (555) 555-1234</a>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <div className="mb-4 inline-flex h-16 w-16 animate-spin items-center justify-center rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
