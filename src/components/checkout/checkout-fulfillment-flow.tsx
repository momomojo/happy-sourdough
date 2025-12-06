'use client';

/**
 * Checkout Fulfillment Flow
 *
 * This is an example integration component showing how to use all the
 * delivery scheduling components together in a checkout flow.
 *
 * Usage:
 * Import this component in your checkout page and pass the cart subtotal.
 * The component manages the state flow and provides callbacks for final selection.
 */

import { useState } from 'react';
import { FulfillmentSelector } from './fulfillment-selector';
import { DeliveryZoneChecker } from './delivery-zone-checker';
import { TimeSlotPicker } from './time-slot-picker';
import { DeliverySummary } from './delivery-summary';
import type { DeliveryType, DeliveryZone, TimeSlot } from '@/types/database';

interface CheckoutFulfillmentFlowProps {
  subtotal: number;
  hasCake?: boolean; // Whether order contains custom cake
  onFulfillmentComplete?: (data: {
    deliveryType: DeliveryType;
    deliveryZone: DeliveryZone | null;
    timeSlot: TimeSlot | null;
    selectedDate: Date | null;
    deliveryFee: number;
    isValid: boolean;
  }) => void;
}

export function CheckoutFulfillmentFlow({
  subtotal,
  hasCake = false,
  onFulfillmentComplete,
}: CheckoutFulfillmentFlowProps) {
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('pickup');
  const [deliveryZone, setDeliveryZone] = useState<DeliveryZone | null>(null);
  const [timeSlot, setTimeSlot] = useState<TimeSlot | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Calculate delivery fee
  const deliveryFee =
    deliveryType === 'delivery' && deliveryZone
      ? calculateDeliveryFee(deliveryZone, subtotal)
      : 0;

  // Validate if fulfillment is complete
  const isValid = Boolean(
    timeSlot &&
      selectedDate &&
      (deliveryType === 'pickup' || (deliveryType === 'delivery' && deliveryZone))
  );

  // Helper function to calculate delivery fee
  function calculateDeliveryFee(zone: DeliveryZone, subtotal: number): number {
    if (zone.id === 1) return 0;
    if (zone.id === 2 && subtotal >= 75) return 0;
    if (zone.id === 3 && subtotal >= 100) return 0;
    return zone.delivery_fee;
  }

  // Notify parent component when fulfillment data changes
  const notifyParent = (updates: Partial<{
    deliveryType: DeliveryType;
    deliveryZone: DeliveryZone | null;
    timeSlot: TimeSlot | null;
    selectedDate: Date | null;
  }>) => {
    const currentData = {
      deliveryType,
      deliveryZone,
      timeSlot,
      selectedDate,
      ...updates,
    };

    const updatedFee =
      currentData.deliveryType === 'delivery' && currentData.deliveryZone
        ? calculateDeliveryFee(currentData.deliveryZone, subtotal)
        : 0;

    const updatedValid = Boolean(
      currentData.timeSlot &&
        currentData.selectedDate &&
        (currentData.deliveryType === 'pickup' ||
          (currentData.deliveryType === 'delivery' && currentData.deliveryZone))
    );

    onFulfillmentComplete?.({
      ...currentData,
      deliveryFee: updatedFee,
      isValid: updatedValid,
    });
  };

  const handleDeliveryTypeChange = (type: DeliveryType) => {
    setDeliveryType(type);
    // Clear delivery-specific data when switching to pickup
    if (type === 'pickup') {
      setDeliveryZone(null);
    }
    notifyParent({ deliveryType: type });
  };

  const handleZoneChange = (zone: DeliveryZone | null) => {
    setDeliveryZone(zone);
    notifyParent({ deliveryZone: zone });
  };

  const handleSlotSelect = (slot: TimeSlot | null, date: Date | null) => {
    setTimeSlot(slot);
    setSelectedDate(date);
    notifyParent({ timeSlot: slot, selectedDate: date });
  };

  return (
    <div className="space-y-6">
      {/* Step 1: Choose Pickup or Delivery */}
      <FulfillmentSelector
        value={deliveryType}
        onChange={handleDeliveryTypeChange}
      />

      {/* Step 2: Delivery Zone Check (only for delivery) */}
      {deliveryType === 'delivery' && (
        <DeliveryZoneChecker
          subtotal={subtotal}
          onZoneChange={handleZoneChange}
        />
      )}

      {/* Step 3: Time Slot Selection */}
      {(deliveryType === 'pickup' || (deliveryType === 'delivery' && deliveryZone)) && (
        <TimeSlotPicker
          deliveryType={deliveryType}
          onSlotSelect={handleSlotSelect}
          hasCake={hasCake}
        />
      )}

      {/* Step 4: Summary */}
      {timeSlot && selectedDate && (
        <DeliverySummary
          deliveryType={deliveryType}
          deliveryZone={deliveryZone}
          timeSlot={timeSlot}
          selectedDate={selectedDate}
          subtotal={subtotal}
        />
      )}
    </div>
  );
}
