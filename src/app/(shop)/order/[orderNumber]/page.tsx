import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { getOrderByNumber } from '@/lib/supabase/orders';
import { OrderStatusTracker } from '@/components/order/order-status-tracker';
import { OrderDetails } from '@/components/order/order-details';
import { Button } from '@/components/ui/button';

interface OrderPageProps {
  params: Promise<{
    orderNumber: string;
  }>;
}

export default async function OrderPage({ params }: OrderPageProps) {
  const { orderNumber } = await params;

  // Fetch order data
  const order = await getOrderByNumber(orderNumber);

  if (!order) {
    notFound();
  }

  // Check if order has decorating step (typically for custom cakes/pastries)
  const hasDecorating = order.status === 'decorating' ||
    order.status_history.some(h => h.status === 'decorating');

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/products"
          className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Shop
        </Link>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Order Tracking</h1>
            <p className="mt-1 text-muted-foreground">
              Track your order status and details
            </p>
          </div>

          {/* Order Number Badge */}
          <div className="rounded-lg border bg-card px-6 py-3 shadow-sm">
            <p className="text-xs text-muted-foreground">Order Number</p>
            <p className="font-mono text-lg font-semibold">{order.order_number}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column - Status Tracker */}
        <div className="lg:col-span-1">
          <OrderStatusTracker
            currentStatus={order.status}
            deliveryType={order.delivery_type}
            hasDecorating={hasDecorating}
            statusHistory={order.status_history}
          />
        </div>

        {/* Right Column - Order Details */}
        <div className="lg:col-span-1">
          <OrderDetails order={order} />
        </div>
      </div>

      {/* Help Section */}
      <div className="mt-8 rounded-lg border bg-muted/50 p-6">
        <h3 className="mb-2 font-semibold">Need Help?</h3>
        <p className="mb-4 text-sm text-muted-foreground">
          If you have questions about your order, please contact us.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" size="sm" asChild>
            <a href="mailto:orders@happysourdough.com">
              <ExternalLink className="mr-2 h-4 w-4" />
              Email Support
            </a>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href="tel:+15555551234">
              Call (555) 555-1234
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: OrderPageProps) {
  const { orderNumber } = await params;

  return {
    title: `Order ${orderNumber} - Happy Sourdough`,
    description: `Track your Happy Sourdough order ${orderNumber}`,
  };
}
