import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Package, ExternalLink } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getUserOrders } from '@/lib/supabase/customer-server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { OrderStatus } from '@/types/database';

const statusColors: Record<OrderStatus, string> = {
  received: 'bg-blue-500',
  confirmed: 'bg-blue-600',
  baking: 'bg-amber-500',
  decorating: 'bg-purple-500',
  quality_check: 'bg-indigo-500',
  ready: 'bg-green-500',
  out_for_delivery: 'bg-cyan-500',
  delivered: 'bg-emerald-600',
  picked_up: 'bg-emerald-600',
  cancelled: 'bg-gray-500',
  refunded: 'bg-red-500',
};

const statusLabels: Record<OrderStatus, string> = {
  received: 'Received',
  confirmed: 'Confirmed',
  baking: 'Baking',
  decorating: 'Decorating',
  quality_check: 'Quality Check',
  ready: 'Ready',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  picked_up: 'Picked Up',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
};

export default async function OrdersPage() {
  const supabase = await createClient();

  // Check if user is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login?redirect=/account/orders');
  }

  // Get user orders
  const orders = await getUserOrders(user.id);

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/account"
          className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Account
        </Link>

        <h1 className="text-3xl font-bold tracking-tight">Order History</h1>
        <p className="mt-1 text-muted-foreground">
          View and track all your orders
        </p>
      </div>

      <Separator className="mb-8" />

      {/* Orders List */}
      {orders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
            <p className="text-sm text-muted-foreground mb-6 text-center max-w-sm">
              You haven&apos;t placed any orders yet. Start shopping for fresh artisan sourdough!
            </p>
            <Button asChild>
              <Link href="/products">Browse Products</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const orderDate = new Date(order.created_at);
            const deliveryDate = new Date(order.delivery_date);

            return (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div>
                      <CardTitle className="text-lg mb-2">
                        Order {order.order_number}
                      </CardTitle>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <p>
                          Placed on {orderDate.toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                        <p>
                          {order.fulfillment_type === 'delivery' ? 'Delivery' : 'Pickup'} on{' '}
                          {deliveryDate.toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-start sm:items-end gap-2">
                      <Badge
                        className={`${statusColors[order.status]} text-white`}
                      >
                        {statusLabels[order.status]}
                      </Badge>
                      <p className="text-lg font-semibold">
                        ${order.total.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button variant="default" asChild className="flex-1 sm:flex-none">
                      <Link href={`/order/${order.order_number}`}>
                        View Details
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                    {(order.status === 'delivered' || order.status === 'picked_up') && (
                      <Button variant="outline" asChild className="flex-1 sm:flex-none">
                        <Link href="/products">Order Again</Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export const metadata = {
  title: 'Order History - Happy Sourdough',
  description: 'View your order history and track your orders',
};
