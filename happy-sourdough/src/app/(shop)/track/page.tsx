import { TrackOrderForm } from '@/components/order/track-order-form';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Track Your Order - Happy Sourdough',
  description: 'Track the status of your Happy Sourdough bakery order',
};

export default function TrackOrderPage() {
  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      {/* Back to Shop Link */}
      <Link
        href="/products"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Shop
      </Link>

      {/* Page Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Track Your Order</h1>
        <p className="mt-2 text-muted-foreground">
          Enter your order details to see the current status of your order
        </p>
      </div>

      {/* Track Order Form Component */}
      <TrackOrderForm />

      {/* Additional Help Section */}
      <div className="mt-12 rounded-lg border bg-muted/50 p-6">
        <h3 className="mb-2 font-semibold">Frequently Asked Questions</h3>
        <div className="space-y-4 text-sm text-muted-foreground">
          <div>
            <p className="font-medium text-foreground">Where can I find my order number?</p>
            <p>
              Your order number was sent to your email immediately after placing your order. It
              starts with &quot;HS-&quot; followed by the year and order number (e.g.,
              HS-2024-001).
            </p>
          </div>
          <div>
            <p className="font-medium text-foreground">
              What if I can&apos;t find my confirmation email?
            </p>
            <p>
              Check your spam or junk folder. If you still can&apos;t find it, please contact us at{' '}
              <a href="mailto:orders@happysourdough.com" className="underline">
                orders@happysourdough.com
              </a>{' '}
              with your name and the email address used for the order.
            </p>
          </div>
          <div>
            <p className="font-medium text-foreground">How often is the order status updated?</p>
            <p>
              We update your order status in real-time as it moves through our bakery. You&apos;ll
              receive email notifications at key milestones.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
