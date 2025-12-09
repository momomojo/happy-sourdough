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

// Bakery-themed warm color palette for order statuses
const statusColors: Record<OrderStatus, string> = {
  received: 'bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-800',
  confirmed: 'bg-indigo-100 text-indigo-800 border border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-200 dark:border-indigo-800',
  baking: 'bg-orange-100 text-orange-800 border border-orange-200 dark:bg-orange-900/30 dark:text-orange-200 dark:border-orange-800',
  decorating: 'bg-pink-100 text-pink-800 border border-pink-200 dark:bg-pink-900/30 dark:text-pink-200 dark:border-pink-800',
  quality_check: 'bg-purple-100 text-purple-800 border border-purple-200 dark:bg-purple-900/30 dark:text-purple-200 dark:border-purple-800',
  ready: 'bg-green-100 text-green-800 border border-green-200 dark:bg-green-900/30 dark:text-green-200 dark:border-green-800',
  out_for_delivery: 'bg-cyan-100 text-cyan-800 border border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-200 dark:border-cyan-800',
  delivered: 'bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-200 dark:border-emerald-800',
  picked_up: 'bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-200 dark:border-emerald-800',
  cancelled: 'bg-gray-100 text-gray-800 border border-gray-200 dark:bg-gray-800/30 dark:text-gray-200 dark:border-gray-700',
  refunded: 'bg-red-100 text-red-800 border border-red-200 dark:bg-red-900/30 dark:text-red-200 dark:border-red-800',
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
          className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Account
        </Link>

        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Order History
        </h1>
        <p className="mt-2 text-muted-foreground">
          Track your fresh bread deliveries and past orders
        </p>
      </div>

      <Separator className="mb-8" />

      {/* Orders List */}
      {orders.length === 0 ? (
        <Card className="border-2 shadow-md rounded-xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-secondary/5 pointer-events-none" />
          <CardContent className="flex flex-col items-center justify-center py-16 relative">
            <div className="p-4 rounded-full bg-secondary/10 mb-6">
              <Package className="h-12 w-12 text-secondary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No orders yet</h3>
            <p className="text-sm text-muted-foreground mb-8 text-center max-w-md">
              You haven&apos;t placed any orders yet. Start shopping for fresh artisan sourdough bread,
              pastries, and custom cakes baked with care!
            </p>
            <Button size="lg" className="shadow-md" asChild>
              <Link href="/products">Browse Our Bakery</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const orderDate = new Date(order.created_at);
            const deliveryDate = new Date(order.delivery_date);

            return (
              <Card key={order.id} className="border-2 shadow-md hover:shadow-lg transition-all duration-300 rounded-xl overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition-transform duration-300" />
                <CardHeader className="relative">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="space-y-2">
                      <CardTitle className="text-xl font-bold">
                        Order {order.order_number}
                      </CardTitle>
                      <div className="space-y-1.5 text-sm text-muted-foreground">
                        <p className="flex items-center gap-2">
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-current"></span>
                          Placed on {orderDate.toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                        <p className="flex items-center gap-2">
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-current"></span>
                          {order.fulfillment_type === 'delivery' ? 'Delivery' : 'Pickup'} on{' '}
                          {deliveryDate.toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-start sm:items-end gap-3">
                      <Badge
                        className={`${statusColors[order.status]} font-semibold px-3 py-1 rounded-lg shadow-sm`}
                      >
                        {statusLabels[order.status]}
                      </Badge>
                      <p className="text-2xl font-bold text-primary">
                        ${order.total.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="relative">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      variant="default"
                      asChild
                      className="flex-1 sm:flex-none shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      <Link href={`/order/${order.order_number}`}>
                        View Details
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                    {(order.status === 'delivered' || order.status === 'picked_up') && (
                      <Button
                        variant="outline"
                        asChild
                        className="flex-1 sm:flex-none border-2 hover:bg-secondary/5 hover:border-secondary/50 transition-all duration-200"
                      >
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
