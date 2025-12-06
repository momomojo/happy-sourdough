'use client';

import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent } from '@/components/ui/card';
import type { DeliveryType } from '@/types/database';
import { ShoppingBag, TruckIcon } from 'lucide-react';

interface FulfillmentSelectorProps {
  value: DeliveryType;
  onChange: (type: DeliveryType) => void;
}

const PICKUP_LOCATION = {
  name: 'Happy Sourdough Bakery',
  address: '123 Main Street',
  city: 'Portland, OR 97201',
  hours: 'Mon-Sat: 7am-7pm, Sun: 8am-6pm',
};

export function FulfillmentSelector({ value, onChange }: FulfillmentSelectorProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-1">Fulfillment Method</h3>
        <p className="text-sm text-muted-foreground">
          Choose how you would like to receive your order
        </p>
      </div>

      <RadioGroup
        value={value}
        onValueChange={(val) => onChange(val as DeliveryType)}
        className="grid gap-4"
      >
        {/* Pickup Option */}
        <Card className={value === 'pickup' ? 'border-primary ring-2 ring-primary' : ''}>
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <RadioGroupItem value="pickup" id="pickup" className="mt-1" />
              <Label
                htmlFor="pickup"
                className="flex-1 cursor-pointer space-y-2"
              >
                <div className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5 text-primary" />
                  <span className="font-semibold">Pickup</span>
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p className="font-medium text-foreground">{PICKUP_LOCATION.name}</p>
                  <p>{PICKUP_LOCATION.address}</p>
                  <p>{PICKUP_LOCATION.city}</p>
                  <p className="pt-1 text-xs">{PICKUP_LOCATION.hours}</p>
                </div>
                <div className="pt-2">
                  <span className="text-sm font-medium text-green-600">
                    Free - No delivery fee
                  </span>
                </div>
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Delivery Option */}
        <Card className={value === 'delivery' ? 'border-primary ring-2 ring-primary' : ''}>
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <RadioGroupItem value="delivery" id="delivery" className="mt-1" />
              <Label
                htmlFor="delivery"
                className="flex-1 cursor-pointer space-y-2"
              >
                <div className="flex items-center gap-2">
                  <TruckIcon className="h-5 w-5 text-primary" />
                  <span className="font-semibold">Delivery</span>
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>Fresh bread delivered to your door</p>
                  <p className="text-xs">
                    Delivery fees and minimums vary by zone
                  </p>
                </div>
                <div className="pt-2 space-y-1">
                  <p className="text-xs text-muted-foreground">
                    Zone 1 (0-3mi): $25 min, Free delivery
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Zone 2 (3-7mi): $40 min, $5 fee (free over $75)
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Zone 3 (7-12mi): $60 min, $10 fee (free over $100)
                  </p>
                </div>
              </Label>
            </div>
          </CardContent>
        </Card>
      </RadioGroup>
    </div>
  );
}
