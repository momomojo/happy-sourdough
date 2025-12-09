import { Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

function SuccessContent() {
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
              <Button asChild>
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

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
