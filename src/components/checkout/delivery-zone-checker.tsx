'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getDeliveryZoneByZip } from '@/lib/supabase/delivery';
import {
  calculateActualDeliveryFee,
  getEstimatedDeliveryTime,
  formatDeliveryTime,
  getFreeDeliveryThreshold,
  isMinimumMet
} from '@/lib/delivery-zones';
import type { DeliveryZone } from '@/types/database';
import { Loader2, MapPin, Check, X, TruckIcon, DollarSign } from 'lucide-react';

interface DeliveryZoneCheckerProps {
  subtotal: number;
  onZoneChange: (zone: DeliveryZone | null) => void;
}

export function DeliveryZoneChecker({ subtotal, onZoneChange }: DeliveryZoneCheckerProps) {
  const [zipCode, setZipCode] = useState('');
  const [zone, setZone] = useState<DeliveryZone | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  const handleCheck = async () => {
    if (!zipCode || zipCode.length < 5) {
      setError('Please enter a valid zip code');
      return;
    }

    setLoading(true);
    setError(null);
    setChecked(false);

    try {
      const deliveryZone = await getDeliveryZoneByZip(zipCode);

      if (!deliveryZone) {
        setError('Sorry, we do not deliver to this zip code yet.');
        setZone(null);
        onZoneChange(null);
      } else {
        setZone(deliveryZone);
        onZoneChange(deliveryZone);
        setChecked(true);
      }
    } catch (err) {
      console.error('Error checking delivery zone:', err);
      setError('Unable to check delivery zone. Please try again.');
      setZone(null);
      onZoneChange(null);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCheck();
    }
  };

  const deliveryFee = zone ? calculateActualDeliveryFee(zone, subtotal) : 0;
  const estimatedTime = zone ? getEstimatedDeliveryTime(zone) : 0;
  const freeThreshold = zone ? getFreeDeliveryThreshold(zone) : null;
  const meetsMinimum = zone ? isMinimumMet(zone, subtotal) : false;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="zipCode">Delivery Zip Code</Label>
        <div className="flex gap-2">
          <Input
            id="zipCode"
            type="text"
            placeholder="Enter zip code"
            value={zipCode}
            onChange={(e) => {
              setZipCode(e.target.value);
              setChecked(false);
              setError(null);
            }}
            onKeyPress={handleKeyPress}
            maxLength={5}
            className="max-w-[150px]"
          />
          <Button
            onClick={handleCheck}
            disabled={loading || !zipCode}
            variant="secondary"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <MapPin className="mr-2 h-4 w-4" />
                Check Zone
              </>
            )}
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <X className="h-5 w-5 text-destructive mt-0.5" />
              <div>
                <p className="font-medium text-destructive">Not Available</p>
                <p className="text-sm text-muted-foreground mt-1">{error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {checked && zone && (
        <Card className="border-primary">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  {zone.name}
                </CardTitle>
                <CardDescription>
                  We deliver to your area!
                </CardDescription>
              </div>
              <Badge variant={deliveryFee === 0 ? "default" : "secondary"}>
                {deliveryFee === 0 ? "Free Delivery" : `$${deliveryFee} Fee`}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              {/* Minimum Order */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <DollarSign className="h-4 w-4" />
                  <span>Minimum Order</span>
                </div>
                <div className="font-medium">
                  ${zone.min_order_amount}
                  {meetsMinimum ? (
                    <Check className="inline ml-2 h-4 w-4 text-green-600" />
                  ) : (
                    <X className="inline ml-2 h-4 w-4 text-destructive" />
                  )}
                </div>
              </div>

              {/* Delivery Fee */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <TruckIcon className="h-4 w-4" />
                  <span>Delivery Fee</span>
                </div>
                <div className="font-medium">
                  {deliveryFee === 0 ? (
                    <span className="text-green-600">Free</span>
                  ) : (
                    <span>${deliveryFee.toFixed(2)}</span>
                  )}
                </div>
              </div>

              {/* Estimated Delivery Time */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>Estimated Time</span>
                </div>
                <div className="font-medium">
                  {formatDeliveryTime(estimatedTime)}
                </div>
              </div>
            </div>

            {/* Free Delivery Threshold Message */}
            {freeThreshold && deliveryFee > 0 && (
              <div className="pt-3 border-t">
                <p className="text-sm text-muted-foreground">
                  Add ${(freeThreshold - subtotal).toFixed(2)} more for free delivery
                </p>
              </div>
            )}

            {/* Minimum Not Met Warning */}
            {!meetsMinimum && (
              <div className="pt-3 border-t">
                <p className="text-sm text-destructive font-medium">
                  Add ${(zone.min_order_amount - subtotal).toFixed(2)} more to meet the minimum order
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
