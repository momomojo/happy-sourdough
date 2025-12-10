'use client';

import { useState } from 'react';
import { CheckoutForm } from '@/components/checkout/checkout-form';
import { OrderSummary } from '@/components/checkout/order-summary';
import { Separator } from '@/components/ui/separator';

export default function CheckoutPage() {
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [discountData, setDiscountData] = useState<{
    discountCodeId: string;
    code: string;
    discountAmount: number;
    discountType: string;
  } | null>(null);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Checkout</h1>
        <p className="text-muted-foreground">
          Complete your order for fresh artisan sourdough
        </p>
      </div>

      <Separator className="mb-8" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Order Summary - Show first on mobile */}
        <div className="lg:col-span-1 lg:order-2">
          <div className="lg:sticky lg:top-20">
            <OrderSummary
              deliveryFee={deliveryFee}
              onDiscountApplied={setDiscountData}
            />
          </div>
        </div>

        {/* Main Checkout Form */}
        <div className="lg:col-span-2 lg:order-1">
          <CheckoutForm
            onDeliveryFeeChange={setDeliveryFee}
            discountData={discountData}
          />
        </div>
      </div>
    </div>
  );
}
