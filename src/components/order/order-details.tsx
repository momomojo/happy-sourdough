'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, Package, Truck } from 'lucide-react';
import { format } from 'date-fns';
import type { OrderWithDetails } from '@/lib/supabase/orders';

interface DeliveryAddressType {
  street?: string;
  apt?: string;
  city?: string;
  state?: string;
  zip?: string;
}

interface OrderDetailsProps {
  order: OrderWithDetails;
}

export function OrderDetails({ order }: OrderDetailsProps) {
  // Cast delivery_address to the proper type
  const deliveryAddress = order.delivery_address as DeliveryAddressType | null;
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="space-y-6">
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
            {order.items.map((item) => (
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

              {(order.delivery_fee ?? 0) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Delivery Fee</span>
                  <span>{formatCurrency(order.delivery_fee ?? 0)}</span>
                </div>
              )}

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax</span>
                <span>{formatCurrency(order.tax_amount ?? 0)}</span>
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
            {order.fulfillment_type === 'delivery' ? (
              <>
                <Truck className="h-5 w-5" />
                Delivery Information
              </>
            ) : (
              <>
                <MapPin className="h-5 w-5" />
                Pickup Information
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Fulfillment Type Badge */}
          <div>
            <Badge variant={order.fulfillment_type === 'delivery' ? 'default' : 'secondary'}>
              {order.fulfillment_type === 'delivery' ? 'Delivery' : 'Pickup'}
            </Badge>
          </div>

          {/* Delivery Address */}
          {order.fulfillment_type === 'delivery' && deliveryAddress && (
            <div>
              <p className="mb-1 text-sm font-medium text-muted-foreground">Delivery Address</p>
              <p className="text-sm">
                {deliveryAddress.street}
                {deliveryAddress.apt && `, ${deliveryAddress.apt}`}
              </p>
              <p className="text-sm text-muted-foreground">
                {deliveryAddress.city}, {deliveryAddress.state} {deliveryAddress.zip}
              </p>
              {order.notes && (
                <p className="mt-2 text-sm italic text-muted-foreground">
                  Instructions: {order.notes}
                </p>
              )}
            </div>
          )}

          {/* Pickup Location */}
          {order.fulfillment_type === 'pickup' && (
            <div>
              <p className="mb-1 text-sm font-medium text-muted-foreground">Pickup Location</p>
              <p className="text-sm font-medium">Happy Sourdough Bakery</p>
              <p className="text-sm text-muted-foreground">123 Main Street</p>
              <p className="text-sm text-muted-foreground">Your City, ST 12345</p>
            </div>
          )}

          {/* Delivery/Pickup Date & Time */}
          {order.delivery_date && (
            <div className="flex items-start gap-3">
              <Calendar className="mt-0.5 h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {order.fulfillment_type === 'delivery' ? 'Estimated Delivery' : 'Pickup Time'}
                </p>
                <p className="text-sm font-semibold">
                  {format(new Date(order.delivery_date), 'EEEE, MMMM d, yyyy')}
                </p>
                {order.delivery_window && (
                  <p className="text-sm text-muted-foreground">{order.delivery_window}</p>
                )}
              </div>
            </div>
          )}

          {/* Order Notes */}
          {order.notes && (
            <div>
              <p className="mb-1 text-sm font-medium text-muted-foreground">Order Notes</p>
              <p className="text-sm">{order.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Information */}
      <Card>
        <CardHeader>
          <CardTitle>Order Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Order Number</p>
              <p className="font-mono font-semibold">{order.order_number}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Order Date</p>
              <p className="font-medium">
                {order.created_at ? format(new Date(order.created_at), 'MMM d, yyyy h:mm a') : 'N/A'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
