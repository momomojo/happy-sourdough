import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ShoppingCart } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getOrderById } from '@/lib/supabase/orders';
import { OrderStatusTracker } from '@/components/order/order-status-tracker';
import { OrderDetails } from '@/components/order/order-details';
import { CancelOrderButton } from '@/components/order/cancel-order-button';
import { Button } from '@/components/ui/button';
import { ReorderButton } from '@/components/order/reorder-button';

interface OrderDetailPageProps {
  params: Promise<{
    orderId: string;
  }>;
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { orderId } = await params;
  const supabase = await createClient();

  // Check if user is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login?redirect=/account/orders');
  }

  // Fetch order data
  const order = await getOrderById(orderId);

  if (!order) {
    notFound();
  }

  // Ensure order belongs to the logged-in user
  if (order.user_id !== user.id) {
    notFound();
  }

  // Check if order has decorating step (typically for custom cakes/pastries)
  const hasDecorating = order.status === 'decorating' ||
    order.status_history.some(h => h.status === 'decorating');

  // Check if reorder is available
  const canReorder = order.status === 'delivered' || order.status === 'picked_up';

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/account/orders"
          className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Order History
        </Link>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Order Details
            </h1>
            <p className="mt-2 text-muted-foreground">
              Track your order and view details
            </p>
          </div>

          {/* Order Number Badge */}
          <div className="rounded-xl border-2 bg-gradient-to-br from-accent/10 to-secondary/10 px-6 py-3 shadow-md">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Order Number</p>
            <p className="font-mono text-xl font-bold text-primary">{order.order_number}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column - Status Tracker */}
        <div className="lg:col-span-1">
          <OrderStatusTracker
            currentStatus={order.status}
            deliveryType={order.fulfillment_type}
            hasDecorating={hasDecorating}
            statusHistory={order.status_history}
          />
        </div>

        {/* Right Column - Order Details */}
        <div className="lg:col-span-1">
          <OrderDetails order={order} />
        </div>
      </div>

      {/* Cancel Order Section - Only show for cancellable orders */}
      {(order.status === 'received' || order.status === 'confirmed') && (
        <div className="mt-8 rounded-xl border-2 border-destructive/20 bg-gradient-to-r from-destructive/5 to-destructive/10 p-6 shadow-md">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="mb-2 font-bold text-lg">Need to Cancel?</h3>
              <p className="text-sm text-muted-foreground">
                You can cancel your order before we start baking. Once baking begins, cancellation is no longer possible.
              </p>
            </div>
            <CancelOrderButton
              orderId={order.id}
              orderNumber={order.order_number}
              status={order.status}
            />
          </div>
        </div>
      )}

      {/* Reorder Section */}
      {canReorder && (
        <div className="mt-6 rounded-xl border-2 bg-gradient-to-r from-accent/5 to-secondary/5 p-6 shadow-md">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="mb-2 font-bold text-lg">Love what you ordered?</h3>
              <p className="text-sm text-muted-foreground">
                Reorder the same items with one click and save time!
              </p>
            </div>
            <ReorderButton items={order.items} />
          </div>
        </div>
      )}

      {/* Help Section */}
      <div className="mt-6 rounded-xl border-2 bg-gradient-to-r from-primary/5 to-secondary/5 p-6 shadow-md">
        <h3 className="mb-2 font-bold text-lg">Need Help?</h3>
        <p className="mb-4 text-sm text-muted-foreground">
          Questions about your order? Our friendly bakery team is here to help!
        </p>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            size="sm"
            asChild
            className="border-2 hover:bg-primary/5 hover:border-primary/50 transition-all duration-200"
          >
            <a href="mailto:orders@happysourdough.com">
              Email Support
            </a>
          </Button>
          <Button
            variant="outline"
            size="sm"
            asChild
            className="border-2 hover:bg-secondary/5 hover:border-secondary/50 transition-all duration-200"
          >
            <a href="tel:+15555551234">
              Call (555) 555-1234
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: OrderDetailPageProps) {
  const { orderId } = await params;

  return {
    title: `Order Details - Happy Sourdough`,
    description: `View details for order ${orderId}`,
  };
}
