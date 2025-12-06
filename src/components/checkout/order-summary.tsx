'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/cart-context';
import { Tag } from 'lucide-react';

interface OrderSummaryProps {
  deliveryFee?: number;
  taxRate?: number;
}

export function OrderSummary({ deliveryFee = 0, taxRate = 0.08 }: OrderSummaryProps) {
  const { items, subtotal } = useCart();
  const [discountCode, setDiscountCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [isApplyingCode, setIsApplyingCode] = useState(false);

  const taxAmount = subtotal * taxRate;
  const total = subtotal + deliveryFee + taxAmount - discount;

  const handleApplyDiscount = async () => {
    setIsApplyingCode(true);
    // TODO: Implement discount code validation via API
    // For now, just a placeholder
    setTimeout(() => {
      if (discountCode === 'WELCOME10') {
        setDiscount(subtotal * 0.1);
      }
      setIsApplyingCode(false);
    }, 500);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Cart Items */}
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.variantId} className="flex justify-between text-sm">
              <div className="flex-1">
                <p className="font-medium">{item.productName}</p>
                <p className="text-muted-foreground text-xs">
                  {item.variantName} × {item.quantity}
                </p>
              </div>
              <p className="font-medium">
                ${(item.unitPrice * item.quantity).toFixed(2)}
              </p>
            </div>
          ))}
        </div>

        <Separator />

        {/* Discount Code */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Discount code"
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                className="pl-9"
              />
            </div>
            <Button
              variant="outline"
              onClick={handleApplyDiscount}
              disabled={!discountCode || isApplyingCode}
            >
              Apply
            </Button>
          </div>
        </div>

        <Separator />

        {/* Price Breakdown */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>

          {deliveryFee > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Delivery Fee</span>
              <span>${deliveryFee.toFixed(2)}</span>
            </div>
          )}

          {deliveryFee === 0 && items.length > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Delivery Fee</span>
              <span className="text-green-600 font-medium">FREE</span>
            </div>
          )}

          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tax (estimated)</span>
            <span>${taxAmount.toFixed(2)}</span>
          </div>

          {discount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Discount</span>
              <span>-${discount.toFixed(2)}</span>
            </div>
          )}
        </div>

        <Separator />

        {/* Total */}
        <div className="flex justify-between text-lg font-bold">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>

        {/* Free Delivery Banner */}
        {deliveryFee > 0 && subtotal < 25 && (
          <div className="bg-accent/10 border border-accent/20 rounded-lg p-3 text-sm">
            <p className="font-medium text-accent">
              Add ${(25 - subtotal).toFixed(2)} more for free delivery!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
