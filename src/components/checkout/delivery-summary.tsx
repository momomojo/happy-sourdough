'use client';

import { format, addMinutes } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  calculateActualDeliveryFee,
  getEstimatedDeliveryTime,
  formatDeliveryTime,
  isMinimumMet,
} from '@/lib/delivery-zones';
import type { DeliveryZone, TimeSlot, DeliveryType } from '@/types/database';
import { Calendar, Clock, MapPin, TruckIcon, AlertCircle, DollarSign } from 'lucide-react';

interface DeliverySummaryProps {
  deliveryType: DeliveryType;
  deliveryZone: DeliveryZone | null;
  timeSlot: TimeSlot | null;
  selectedDate: Date | null;
  subtotal: number;
}

export function DeliverySummary({
  deliveryType,
  deliveryZone,
  timeSlot,
  selectedDate,
  subtotal,
}: DeliverySummaryProps) {
  // Calculate delivery fee
  const deliveryFee = deliveryZone
    ? calculateActualDeliveryFee(deliveryZone, subtotal)
    : 0;

  // Get estimated delivery time in minutes
  const estimatedMinutes = deliveryZone
    ? getEstimatedDeliveryTime(deliveryZone)
    : 0;

  // Check if minimum is met
  const meetsMinimum = deliveryZone
    ? isMinimumMet(deliveryZone, subtotal)
    : true;

  // Calculate estimated arrival time (slot start + delivery time)
  const getEstimatedArrival = () => {
    if (!timeSlot || !selectedDate) return null;

    // Parse the start time (format: "08:00:00")
    const [hours, minutes] = timeSlot.start_time.split(':').map(Number);
    const slotStart = new Date(selectedDate);
    slotStart.setHours(hours, minutes, 0);

    // Add estimated delivery time for delivery orders
    if (deliveryType === 'delivery') {
      return addMinutes(slotStart, estimatedMinutes);
    }

    return slotStart;
  };

  const estimatedArrival = getEstimatedArrival();

  const formatTimeRange = (startTime: string, endTime: string) => {
    const formatTime = (time: string) => {
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      return `${displayHour}:${minutes} ${ampm}`;
    };

    return `${formatTime(startTime)} - ${formatTime(endTime)}`;
  };

  // Don't show summary if nothing is selected
  if (!selectedDate || !timeSlot) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>
            {deliveryType === 'pickup' ? 'Pickup' : 'Delivery'} Details
          </span>
          {deliveryType === 'delivery' && (
            <Badge variant={deliveryFee === 0 ? 'default' : 'secondary'}>
              {deliveryFee === 0 ? 'Free Delivery' : `$${deliveryFee} Fee`}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Date and Time */}
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium">Date</p>
              <p className="text-sm text-muted-foreground">
                {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium">Time Window</p>
              <p className="text-sm text-muted-foreground">
                {formatTimeRange(timeSlot.start_time, timeSlot.end_time)}
              </p>
            </div>
          </div>
        </div>

        {deliveryType === 'delivery' && deliveryZone && (
          <>
            <Separator />

            {/* Delivery Info */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Delivery Zone</p>
                  <p className="text-sm text-muted-foreground">
                    {deliveryZone.name}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <TruckIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Estimated Arrival</p>
                  <p className="text-sm text-muted-foreground">
                    {estimatedArrival
                      ? format(estimatedArrival, 'h:mm a')
                      : 'During selected window'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Typical delivery time: {formatDeliveryTime(estimatedMinutes)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Delivery Fee</p>
                  <p className="text-sm text-muted-foreground">
                    {deliveryFee === 0 ? (
                      <span className="text-green-600 font-medium">
                        Free delivery
                      </span>
                    ) : (
                      <span>${deliveryFee.toFixed(2)}</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {deliveryType === 'pickup' && (
          <>
            <Separator />

            {/* Pickup Location */}
            <div className="space-y-1">
              <p className="text-sm font-medium">Pickup Location</p>
              <div className="text-sm text-muted-foreground">
                <p>Happy Sourdough Bakery</p>
                <p>123 Main Street</p>
                <p>Portland, OR 97201</p>
              </div>
            </div>
          </>
        )}

        {/* Minimum Order Warning */}
        {deliveryType === 'delivery' && deliveryZone && !meetsMinimum && (
          <>
            <Separator />
            <div className="flex items-start gap-3 p-3 bg-destructive/10 rounded-lg">
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-destructive">
                  Minimum Order Not Met
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Add ${(deliveryZone.min_order_amount - subtotal).toFixed(2)} more to meet the ${deliveryZone.min_order_amount} minimum for {deliveryZone.name}
                </p>
              </div>
            </div>
          </>
        )}

        {/* Free Delivery Upsell */}
        {deliveryType === 'delivery' &&
          deliveryZone &&
          deliveryFee > 0 &&
          meetsMinimum && (
            <>
              <Separator />
              <div className="p-3 bg-primary/5 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  {deliveryZone.id === 2 && subtotal < 75 && (
                    <>
                      Add ${(75 - subtotal).toFixed(2)} more for free delivery
                    </>
                  )}
                  {deliveryZone.id === 3 && subtotal < 100 && (
                    <>
                      Add ${(100 - subtotal).toFixed(2)} more for free delivery
                    </>
                  )}
                </p>
              </div>
            </>
          )}
      </CardContent>
    </Card>
  );
}
