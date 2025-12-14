'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/cart-context';
import { Tag, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';

interface OrderSummaryProps {
  deliveryFee?: number;
  taxRate?: number;
  userTier?: 'bronze' | 'silver' | 'gold';
  onDiscountApplied?: (discountData: {
    discountCodeId: string;
    code: string;
    discountAmount: number;
    discountType: string;
  } | null) => void;
}

export function OrderSummary({ deliveryFee = 0, taxRate = 0.08, userTier = 'bronze', onDiscountApplied }: OrderSummaryProps) {
  const { items, subtotal } = useCart();
  const [discountCode, setDiscountCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [isApplyingCode, setIsApplyingCode] = useState(false);
  const [appliedDiscountCode, setAppliedDiscountCode] = useState<string | null>(null);
  const [discountCodeId, setDiscountCodeId] = useState<string | null>(null);
  const [discountType, setDiscountType] = useState<string | null>(null);

  const taxAmount = subtotal * taxRate;
  const total = subtotal + deliveryFee + taxAmount - discount;

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) {
      toast.error('Please enter a discount code');
      return;
    }

    setIsApplyingCode(true);

    try {
      const response = await fetch('/api/discounts/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: discountCode,
          subtotal,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || 'Invalid discount code');
        setDiscount(0);
        setAppliedDiscountCode(null);
        setDiscountCodeId(null);
        setDiscountType(null);
        onDiscountApplied?.(null);
        return;
      }

      // Apply the discount
      setDiscount(result.discountAmount);
      setAppliedDiscountCode(result.code);
      setDiscountCodeId(result.discountCodeId);
      setDiscountType(result.discountType);

      // Notify parent component
      onDiscountApplied?.({
        discountCodeId: result.discountCodeId,
        code: result.code,
        discountAmount: result.discountAmount,
        discountType: result.discountType,
      });

      toast.success(
        result.discountType === 'percentage'
          ? `${result.discountValue}% discount applied!`
          : `$${result.discountAmount.toFixed(2)} discount applied!`
      );
    } catch (error) {
      console.error('Error applying discount:', error);
      toast.error('Failed to apply discount code');
      setDiscount(0);
      setAppliedDiscountCode(null);
      setDiscountCodeId(null);
      setDiscountType(null);
      onDiscountApplied?.(null);
    } finally {
      setIsApplyingCode(false);
    }
  };

  const handleRemoveDiscount = () => {
    setDiscount(0);
    setDiscountCode('');
    setAppliedDiscountCode(null);
    setDiscountCodeId(null);
    setDiscountType(null);
    onDiscountApplied?.(null);
    toast.success('Discount code removed');
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
          {appliedDiscountCode ? (
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                <div>
                  <p className="text-sm font-medium text-green-900 dark:text-green-100">
                    Code applied: {appliedDiscountCode}
                  </p>
                  <p className="text-xs text-green-700 dark:text-green-300">
                    Saving ${discount.toFixed(2)}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemoveDiscount}
                className="text-green-700 hover:text-green-900 dark:text-green-300 dark:hover:text-green-100"
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Discount code"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleApplyDiscount();
                    }
                  }}
                  className="pl-9"
                  disabled={isApplyingCode}
                />
              </div>
              <Button
                variant="outline"
                onClick={handleApplyDiscount}
                disabled={!discountCode || isApplyingCode}
              >
                {isApplyingCode ? 'Checking...' : 'Apply'}
              </Button>
            </div>
          )}
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

        {/* Loyalty Points */}
        <div className="flex items-center justify-between text-xs bg-primary/5 p-2 rounded text-muted-foreground">
          <span>Points to be earned</span>
          <span className="font-semibold text-primary">
            {Math.floor((subtotal - discount) * (userTier === 'gold' ? 1.5 : userTier === 'silver' ? 1.25 : 1))} pts
          </span>
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
