import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, Package, User, FileText } from 'lucide-react';
import { getOrderById } from '@/lib/supabase/admin/orders';
import { getOrderItems, getOrderStatusHistory } from '@/lib/supabase/orders';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { OrderStatusUpdate } from '@/components/admin/orders/order-status-update';
import { OrderNotesForm } from '@/components/admin/orders/order-notes-form';
import { OrderStatus } from '@/types/database';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

const STATUS_COLORS: Record<OrderStatus, string> = {
  received: 'bg-gray-500',
  confirmed: 'bg-blue-500',
  baking: 'bg-amber-500',
  decorating: 'bg-amber-500',
  quality_check: 'bg-amber-500',
  ready: 'bg-green-500',
  out_for_delivery: 'bg-green-500',
  delivered: 'bg-green-600',
  picked_up: 'bg-green-600',
  cancelled: 'bg-red-500',
  refunded: 'bg-red-600',
};

const STATUS_LABELS: Record<OrderStatus, string> = {
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

export default async function OrderDetailPage({ params }: PageProps) {
  const { id } = await params;
  const order = await getOrderById(id);

  if (!order) {
    notFound();
  }

  const items = await getOrderItems(id);
  const statusHistory = await getOrderStatusHistory(id);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/orders">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Orders
              </Link>
            </Button>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Order {order.order_number}
          </h1>
          <p className="text-muted-foreground">
            Placed on {formatDate(order.created_at)}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge className={STATUS_COLORS[order.status]} variant="default">
            {STATUS_LABELS[order.status]}
          </Badge>
          <OrderStatusUpdate orderId={order.id} currentStatus={order.status} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Order Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="font-medium">{item.product_name}</h4>
                      {item.variant_name && item.variant_name !== 'Standard' && (
                        <p className="text-sm text-muted-foreground">{item.variant_name}</p>
                      )}
                      {item.special_instructions && (
                        <p className="mt-1 text-sm italic text-muted-foreground">
                          Note: {item.special_instructions}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {item.quantity} x {formatCurrency(item.unit_price)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(item.total_price)}
                      </p>
                    </div>
                  </div>
                ))}

                <Separator />

                {/* Order Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatCurrency(order.subtotal)}</span>
                  </div>

                  {order.delivery_fee > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Delivery Fee</span>
                      <span>{formatCurrency(order.delivery_fee)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span>{formatCurrency(order.tax_amount)}</span>
                  </div>

                  <Separator />

                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>{formatCurrency(order.total)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delivery/Pickup Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {order.fulfillment_type === 'delivery' ? 'Delivery' : 'Pickup'} Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Badge variant={order.fulfillment_type === 'delivery' ? 'default' : 'secondary'}>
                  {order.fulfillment_type === 'delivery' ? 'Delivery' : 'Pickup'}
                </Badge>
              </div>

              {order.fulfillment_type === 'delivery' && order.delivery_address && (
                <div>
                  <p className="mb-1 text-sm font-medium text-muted-foreground">Delivery Address</p>
                  <p className="text-sm">
                    {order.delivery_address.street}
                    {order.delivery_address.apt && `, ${order.delivery_address.apt}`}
                    <br />
                    {order.delivery_address.city}, {order.delivery_address.state} {order.delivery_address.zip}
                  </p>
                  {order.notes && (
                    <p className="mt-2 text-sm italic text-muted-foreground">
                      Instructions: {order.notes}
                    </p>
                  )}
                </div>
              )}

              {order.fulfillment_type === 'pickup' && (
                <div>
                  <p className="mb-1 text-sm font-medium text-muted-foreground">Pickup Location</p>
                  <p className="text-sm font-medium">Happy Sourdough Bakery</p>
                  <p className="text-sm text-muted-foreground">123 Main Street</p>
                  <p className="text-sm text-muted-foreground">Your City, ST 12345</p>
                </div>
              )}

              {order.delivery_date && (
                <div>
                  <p className="mb-1 text-sm font-medium text-muted-foreground">
                    {order.fulfillment_type === 'delivery' ? 'Estimated Delivery' : 'Pickup Time'}
                  </p>
                  <p className="text-sm font-semibold">
                    {new Date(order.delivery_date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                  {order.delivery_window && (
                    <p className="text-sm text-muted-foreground">{order.delivery_window}</p>
                  )}
                </div>
              )}

              {order.notes && (
                <div>
                  <p className="mb-1 text-sm font-medium text-muted-foreground">Order Notes</p>
                  <p className="text-sm">{order.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Customer & Status History */}
        <div className="space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Name</p>
                <p className="font-medium">{order.customer_name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p className="text-sm">{order.customer_email}</p>
              </div>
              {order.customer_phone && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Phone</p>
                  <p className="text-sm">{order.customer_phone}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status History */}
          <Card>
            <CardHeader>
              <CardTitle>Status History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {statusHistory.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No status history available</p>
                ) : (
                  statusHistory.map((history, index) => (
                    <div key={history.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`h-3 w-3 rounded-full ${STATUS_COLORS[history.status]}`} />
                        {index < statusHistory.length - 1 && (
                          <div className="w-0.5 flex-1 bg-border mt-1" />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-center gap-2">
                          <Badge className={`${STATUS_COLORS[history.status]} text-xs`}>
                            {STATUS_LABELS[history.status]}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDate(history.created_at)}
                        </p>
                        {history.notes && (
                          <p className="text-sm mt-2">{history.notes}</p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Order Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Internal Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <OrderNotesForm orderId={order.id} initialNotes={order.internal_notes || ''} />
            </CardContent>
          </Card>

          {/* Payment Information */}
          {order.stripe_payment_intent_id && (
            <Card>
              <CardHeader>
                <CardTitle>Payment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Payment ID</p>
                  <p className="text-xs font-mono break-all">{order.stripe_payment_intent_id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    Paid
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
