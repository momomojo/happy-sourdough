import { TrackOrderForm } from '@/components/order/track-order-form';
import Link from 'next/link';
import { ArrowLeft, Package, MapPin, Clock } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Track Your Order - Happy Sourdough',
  description: 'Track the status of your Happy Sourdough bakery order',
};

export default function TrackOrderPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-orange-50 to-amber-100 dark:from-stone-900 dark:to-stone-800 py-16">
        <div className="container mx-auto max-w-5xl px-4">
          {/* Back to Shop Link */}
          <Link
            href="/products"
            className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Shop
          </Link>

          {/* Page Header */}
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
              <Package className="w-8 h-8" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
              Track Your Order
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Follow your freshly baked goods from our ovens to your doorstep
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 bg-background flex-1">
        <div className="container mx-auto max-w-5xl px-4">
          {/* Track Order Form Component */}
          <TrackOrderForm />

          {/* Additional Help Section */}
          <div className="mt-12 rounded-2xl border-2 border-primary/10 bg-gradient-to-br from-muted/30 to-muted/50 p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-foreground">Need Help?</h3>
            </div>

            <div className="space-y-6">
              <div className="bg-background/60 rounded-xl p-6 border border-primary/5">
                <p className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                  Where can I find my order number?
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Your order number was sent to your email immediately after placing your order. It
                  starts with &quot;HS-&quot; followed by the year and order number (e.g.,
                  HS-2024-001).
                </p>
              </div>

              <div className="bg-background/60 rounded-xl p-6 border border-primary/5">
                <p className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                  What if I can&apos;t find my confirmation email?
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Check your spam or junk folder. If you still can&apos;t find it, please contact us at{' '}
                  <a href="mailto:orders@happysourdough.com" className="text-primary hover:underline font-medium">
                    orders@happysourdough.com
                  </a>{' '}
                  with your name and the email address used for the order.
                </p>
              </div>

              <div className="bg-background/60 rounded-xl p-6 border border-primary/5">
                <p className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                  How often is the order status updated?
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  We update your order status in real-time as it moves through our bakery. You&apos;ll
                  receive email notifications at key milestones.
                </p>
              </div>
            </div>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="text-center p-6 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                <Clock className="w-6 h-6" />
              </div>
              <h4 className="font-semibold text-foreground mb-2">Real-Time Updates</h4>
              <p className="text-sm text-muted-foreground">
                Track every step from our oven to your door
              </p>
            </div>

            <div className="text-center p-6 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                <MapPin className="w-6 h-6" />
              </div>
              <h4 className="font-semibold text-foreground mb-2">Delivery Updates</h4>
              <p className="text-sm text-muted-foreground">
                Get notified when your order is out for delivery
              </p>
            </div>

            <div className="text-center p-6 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                <Package className="w-6 h-6" />
              </div>
              <h4 className="font-semibold text-foreground mb-2">Fresh Guarantee</h4>
              <p className="text-sm text-muted-foreground">
                All orders baked fresh to order, same day
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
