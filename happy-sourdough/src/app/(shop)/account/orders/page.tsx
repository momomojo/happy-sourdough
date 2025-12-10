import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Package } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getUserOrders } from '@/lib/supabase/customer-server';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { OrdersListClient } from '@/components/account/orders-list-client';

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
        <OrdersListClient orders={orders} />
      )}
    </div>
  );
}

export const metadata = {
  title: 'Order History - Happy Sourdough',
  description: 'View your order history and track your orders',
};
