'use client';

import { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { OrderStatusTracker } from '@/components/order/order-status-tracker';
import { OrderDetails } from '@/components/order/order-details';
import { trackOrderByNumberAndEmail } from '@/lib/supabase/track-order';
import type { OrderWithDetails } from '@/lib/supabase/orders';
import type { OrderStatus } from '@/types/database';

export function TrackOrderForm() {
  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [order, setOrder] = useState<OrderWithDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setOrder(null);

    try {
      const result = await trackOrderByNumberAndEmail(orderNumber.trim(), email.trim());

      if (!result) {
        setError(
          'Order not found. Please check your order number and email address and try again.'
        );
      } else {
        setOrder(result);
      }
    } catch (err) {
      console.error('Error tracking order:', err);
      setError('An error occurred while tracking your order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setOrder(null);
    setError(null);
    setOrderNumber('');
    setEmail('');
  };

  // If order found, show the order details
  if (order) {
    // Check if order has decorating step
    const hasDecorating =
      order.status === 'decorating' ||
      order.status_history.some((h) => h.status === 'decorating');

    return (
      <div className="space-y-6">
        {/* Header with order number */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Order Tracking</h2>
            <p className="text-muted-foreground">Track your order status and details</p>
          </div>

          {/* Order Number Badge */}
          <div className="rounded-lg border bg-card px-6 py-3 shadow-sm">
            <p className="text-xs text-muted-foreground">Order Number</p>
            <p className="font-mono text-lg font-semibold">{order.order_number}</p>
          </div>
        </div>

        {/* Track Another Order Button */}
        <div className="flex justify-end">
          <Button variant="outline" onClick={handleReset} size="sm">
            Track Another Order
          </Button>
        </div>

        {/* Order Status and Details */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left Column - Status Tracker */}
          <div className="lg:col-span-1">
            <OrderStatusTracker
              currentStatus={(order.status ?? 'received') as OrderStatus}
              deliveryType={(order.fulfillment_type ?? 'pickup') as 'pickup' | 'delivery'}
              hasDecorating={hasDecorating}
              statusHistory={(order.status_history ?? []).map(h => ({
                status: h.status as OrderStatus,
                created_at: h.created_at ?? new Date().toISOString()
              }))}
            />
          </div>

          {/* Right Column - Order Details */}
          <div className="lg:col-span-1">
            <OrderDetails order={order} />
          </div>
        </div>
      </div>
    );
  }

  // Show the search form
  return (
    <div className="mx-auto max-w-md">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Track Your Order
          </CardTitle>
          <CardDescription>
            Enter your order number and email address to track your order status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="orderNumber">Order Number</Label>
              <Input
                id="orderNumber"
                type="text"
                placeholder="HS-2024-001"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                required
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                Find this in your order confirmation email
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                The email address used when placing the order
              </p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Tracking Order...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Track Order
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 rounded-lg bg-muted/50 p-4">
            <p className="text-sm font-medium">Need Help?</p>
            <p className="mt-1 text-sm text-muted-foreground">
              If you&apos;re having trouble tracking your order, please contact us at{' '}
              <a href="mailto:orders@happysourdough.com" className="underline">
                orders@happysourdough.com
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
