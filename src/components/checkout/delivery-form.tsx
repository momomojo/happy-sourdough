'use client';

import { useEffect, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CheckoutFormData } from '@/types/checkout';
import { DEFAULT_ZONES } from '@/lib/delivery-zones';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MapPin, Package } from 'lucide-react';

interface DeliveryFormProps {
  form: UseFormReturn<CheckoutFormData>;
  onDeliveryFeeChange: (fee: number) => void;
}

export function DeliveryForm({ form, onDeliveryFeeChange }: DeliveryFormProps) {
  const fulfillmentType = form.watch('fulfillmentType');
  const zip = form.watch('deliveryAddress.zip');
  const [deliveryZone, setDeliveryZone] = useState<typeof DEFAULT_ZONES[0] | null>(null);

  // Validate ZIP code against delivery zones
  useEffect(() => {
    if (fulfillmentType === 'delivery' && zip && zip.length === 5) {
      // In a real app, you would geocode the address to get distance
      // For now, we'll do a simple zone assignment based on ZIP prefix
      const zipNum = parseInt(zip);

      // Mock zone assignment (replace with actual geocoding)
      let zone = null;
      if (zipNum >= 90001 && zipNum <= 90010) {
        zone = DEFAULT_ZONES[0]; // Zone 1
      } else if (zipNum >= 90011 && zipNum <= 90050) {
        zone = DEFAULT_ZONES[1]; // Zone 2
      } else if (zipNum >= 90051 && zipNum <= 90100) {
        zone = DEFAULT_ZONES[2]; // Zone 3
      }

      setDeliveryZone(zone);
      onDeliveryFeeChange(zone?.delivery_fee ?? 0);
    } else {
      setDeliveryZone(null);
      onDeliveryFeeChange(0);
    }
  }, [zip, fulfillmentType, onDeliveryFeeChange]);

  return (
    <div className="space-y-6">
      {/* Fulfillment Type Selection */}
      <div className="space-y-2">
        <Label>Fulfillment Type</Label>
        <Select
          value={fulfillmentType}
          onValueChange={(value) =>
            form.setValue('fulfillmentType', value as 'delivery' | 'pickup')
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="delivery">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>Delivery</span>
              </div>
            </SelectItem>
            <SelectItem value="pickup">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                <span>Pickup at Bakery</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Contact Information */}
      <div className="space-y-4">
        <h3 className="font-semibold">Contact Information</h3>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="your@email.com"
            {...form.register('email')}
          />
          {form.formState.errors.email && (
            <p className="text-sm text-destructive">
              {form.formState.errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            placeholder="John Doe"
            {...form.register('fullName')}
          />
          {form.formState.errors.fullName && (
            <p className="text-sm text-destructive">
              {form.formState.errors.fullName.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="(555) 123-4567"
            {...form.register('phone')}
          />
          {form.formState.errors.phone && (
            <p className="text-sm text-destructive">
              {form.formState.errors.phone.message}
            </p>
          )}
        </div>
      </div>

      {/* Delivery Address - only show if delivery selected */}
      {fulfillmentType === 'delivery' && (
        <div className="space-y-4">
          <h3 className="font-semibold">Delivery Address</h3>

          <div className="space-y-2">
            <Label htmlFor="street">Street Address</Label>
            <Input
              id="street"
              placeholder="123 Main St"
              {...form.register('deliveryAddress.street')}
            />
            {form.formState.errors.deliveryAddress?.street && (
              <p className="text-sm text-destructive">
                {form.formState.errors.deliveryAddress.street.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="apt">Apartment, Suite, etc. (optional)</Label>
            <Input
              id="apt"
              placeholder="Apt 4B"
              {...form.register('deliveryAddress.apt')}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                placeholder="Los Angeles"
                {...form.register('deliveryAddress.city')}
              />
              {form.formState.errors.deliveryAddress?.city && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.deliveryAddress.city.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                placeholder="CA"
                maxLength={2}
                {...form.register('deliveryAddress.state')}
              />
              {form.formState.errors.deliveryAddress?.state && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.deliveryAddress.state.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="zip">ZIP Code</Label>
            <Input
              id="zip"
              placeholder="90001"
              maxLength={5}
              {...form.register('deliveryAddress.zip')}
            />
            {form.formState.errors.deliveryAddress?.zip && (
              <p className="text-sm text-destructive">
                {form.formState.errors.deliveryAddress.zip.message}
              </p>
            )}
          </div>

          {/* Delivery Zone Validation Message */}
          {zip && zip.length === 5 && (
            <>
              {deliveryZone ? (
                <Alert>
                  <MapPin className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-1">
                      <p className="font-medium">{deliveryZone.name}</p>
                      <p className="text-sm">
                        {deliveryZone.delivery_fee === 0
                          ? 'Free delivery!'
                          : `$${deliveryZone.delivery_fee} delivery fee`}
                        {' · '}
                        ${deliveryZone.min_order_amount} minimum order
                      </p>
                    </div>
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert variant="destructive">
                  <AlertDescription>
                    Sorry, we don&apos;t currently deliver to this area.
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="deliveryInstructions">
              Delivery Instructions (optional)
            </Label>
            <Textarea
              id="deliveryInstructions"
              placeholder="Gate code, special instructions, etc."
              rows={3}
              {...form.register('deliveryInstructions')}
            />
          </div>
        </div>
      )}

      {/* Pickup Information */}
      {fulfillmentType === 'pickup' && (
        <Alert>
          <Package className="h-4 w-4" />
          <AlertDescription>
            <p className="font-medium">Happy Sourdough Bakery</p>
            <p className="text-sm mt-1">123 Baker Street, Los Angeles, CA 90001</p>
            <p className="text-sm text-muted-foreground mt-1">
              Open daily 7am - 7pm
            </p>
          </AlertDescription>
        </Alert>
      )}

      {/* Delivery Date & Time Selection */}
      <div className="space-y-4">
        <h3 className="font-semibold">
          {fulfillmentType === 'delivery' ? 'Delivery' : 'Pickup'} Time
        </h3>

        <div className="space-y-2">
          <Label htmlFor="deliveryDate">Date</Label>
          <Input
            id="deliveryDate"
            type="date"
            min={new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
            {...form.register('deliveryDate')}
          />
          {form.formState.errors.deliveryDate && (
            <p className="text-sm text-destructive">
              {form.formState.errors.deliveryDate.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="deliveryWindow">Time Window</Label>
          <Select
            value={form.watch('deliveryWindow')}
            onValueChange={(value) => form.setValue('deliveryWindow', value)}
          >
            <SelectTrigger id="deliveryWindow">
              <SelectValue placeholder="Select a time window" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7am-9am">7:00 AM - 9:00 AM</SelectItem>
              <SelectItem value="9am-11am">9:00 AM - 11:00 AM</SelectItem>
              <SelectItem value="11am-1pm">11:00 AM - 1:00 PM</SelectItem>
              <SelectItem value="1pm-3pm">1:00 PM - 3:00 PM</SelectItem>
              <SelectItem value="3pm-5pm">3:00 PM - 5:00 PM</SelectItem>
              <SelectItem value="5pm-7pm">5:00 PM - 7:00 PM</SelectItem>
            </SelectContent>
          </Select>
          {form.formState.errors.deliveryWindow && (
            <p className="text-sm text-destructive">
              {form.formState.errors.deliveryWindow.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
