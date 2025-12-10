# Quick Start Guide - Delivery Scheduling System

## 5-Minute Integration

### Step 1: Import the Main Component

```tsx
import { CheckoutFulfillmentFlow } from '@/components/checkout/checkout-fulfillment-flow';
```

### Step 2: Add to Your Checkout Page

```tsx
'use client';

import { useState } from 'react';
import { CheckoutFulfillmentFlow } from '@/components/checkout/checkout-fulfillment-flow';

export default function CheckoutPage() {
  const [fulfillmentData, setFulfillmentData] = useState(null);
  const cartSubtotal = 75.50; // Your cart subtotal
  const hasCustomCake = false; // Check if cart has custom cake

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>

      <CheckoutFulfillmentFlow
        subtotal={cartSubtotal}
        hasCake={hasCustomCake}
        onFulfillmentComplete={(data) => {
          setFulfillmentData(data);
          console.log('Fulfillment complete:', data);
        }}
      />

      {/* Your payment form here */}
      {fulfillmentData?.isValid && (
        <div className="mt-6">
          <button
            onClick={() => {
              // Proceed to payment with:
              // - fulfillmentData.deliveryType
              // - fulfillmentData.deliveryFee
              // - fulfillmentData.timeSlot
              // - fulfillmentData.selectedDate
              // - fulfillmentData.deliveryZone
            }}
          >
            Continue to Payment
          </button>
        </div>
      )}
    </div>
  );
}
```

---

## Individual Components

### Use Only What You Need

If you want to customize the flow, use components individually:

```tsx
import { FulfillmentSelector } from '@/components/checkout/fulfillment-selector';
import { DeliveryZoneChecker } from '@/components/checkout/delivery-zone-checker';
import { TimeSlotPicker } from '@/components/checkout/time-slot-picker';
import { DeliverySummary } from '@/components/checkout/delivery-summary';

export default function CustomCheckout() {
  const [deliveryType, setDeliveryType] = useState('pickup');
  const [zone, setZone] = useState(null);
  const [slot, setSlot] = useState(null);
  const [date, setDate] = useState(null);

  return (
    <div className="space-y-6">
      {/* Step 1: Pickup or Delivery */}
      <FulfillmentSelector
        value={deliveryType}
        onChange={setDeliveryType}
      />

      {/* Step 2: Delivery Zone (if delivery selected) */}
      {deliveryType === 'delivery' && (
        <DeliveryZoneChecker
          subtotal={75.50}
          onZoneChange={setZone}
        />
      )}

      {/* Step 3: Time Slot Selection */}
      {(deliveryType === 'pickup' || zone) && (
        <TimeSlotPicker
          deliveryType={deliveryType}
          onSlotSelect={(slot, date) => {
            setSlot(slot);
            setDate(date);
          }}
          hasCake={false}
        />
      )}

      {/* Step 4: Summary */}
      <DeliverySummary
        deliveryType={deliveryType}
        deliveryZone={zone}
        timeSlot={slot}
        selectedDate={date}
        subtotal={75.50}
      />
    </div>
  );
}
```

---

## Data Access

### Check Delivery Fee Before Payment

```tsx
import { calculateActualDeliveryFee } from '@/lib/delivery-zones';

const deliveryFee = zone
  ? calculateActualDeliveryFee(zone, subtotal)
  : 0;

const total = subtotal + deliveryFee + tax;
```

### Validate Minimum Order

```tsx
import { isMinimumMet } from '@/lib/delivery-zones';

if (deliveryType === 'delivery' && zone) {
  if (!isMinimumMet(zone, subtotal)) {
    alert('Order does not meet minimum requirement');
    return;
  }
}
```

### Reserve Time Slot on Order

```tsx
import { reserveTimeSlot } from '@/lib/supabase/delivery';

// After successful payment
const reserved = await reserveTimeSlot(timeSlot.id);
if (!reserved) {
  // Handle slot no longer available
  alert('Time slot is no longer available');
}
```

### Release Slot on Cancellation

```tsx
import { releaseTimeSlot } from '@/lib/supabase/delivery';

// When order is cancelled
await releaseTimeSlot(order.time_slot_id);
```

---

## Common Patterns

### Check if Order Has Custom Cake

```tsx
const hasCustomCake = cartItems.some(item =>
  item.category === 'cakes' && item.isCustom
);
```

### Calculate Total with Delivery

```tsx
const subtotal = cartItems.reduce((sum, item) => sum + item.price, 0);
const deliveryFee = calculateDeliveryFee(); // From fulfillment data
const tax = subtotal * 0.08; // Your tax rate
const total = subtotal + deliveryFee + tax;
```

### Format for Stripe Checkout

```tsx
const lineItems = [
  ...cartItems.map(item => ({
    price_data: {
      currency: 'usd',
      product_data: { name: item.name },
      unit_amount: Math.round(item.price * 100),
    },
    quantity: item.quantity,
  })),
  // Add delivery fee if applicable
  ...(deliveryFee > 0 ? [{
    price_data: {
      currency: 'usd',
      product_data: { name: 'Delivery Fee' },
      unit_amount: Math.round(deliveryFee * 100),
    },
    quantity: 1,
  }] : []),
];
```

### Save to Order in Supabase

```tsx
const { data: order } = await supabase
  .from('orders')
  .insert({
    user_id: user.id,
    delivery_type: fulfillmentData.deliveryType,
    delivery_zone_id: fulfillmentData.deliveryZone?.id || null,
    time_slot_id: fulfillmentData.timeSlot.id,
    delivery_fee: fulfillmentData.deliveryFee,
    subtotal: cartSubtotal,
    total: total,
    status: 'received',
  })
  .select()
  .single();
```

---

## Styling Customization

### Override Theme Colors

```tsx
<CheckoutFulfillmentFlow
  subtotal={75.50}
  className="custom-checkout"
/>
```

```css
.custom-checkout {
  --primary: your-color;
  --secondary: your-color;
}
```

### Mobile Responsive

All components are mobile-first by default. Calendar popover automatically adjusts on small screens.

---

## Error Handling

### Handle No Available Slots

```tsx
onFulfillmentComplete={(data) => {
  if (!data.timeSlot) {
    // No slot selected yet
    return;
  }

  if (!data.isValid) {
    // Missing required data
    alert('Please complete all fields');
    return;
  }

  // Proceed with checkout
}}
```

### Handle Zip Code Not Serviced

```tsx
<DeliveryZoneChecker
  subtotal={subtotal}
  onZoneChange={(zone) => {
    if (!zone) {
      // Show message: "We don't deliver to your area yet"
      setCanProceed(false);
    } else {
      setCanProceed(true);
    }
  }}
/>
```

---

## Testing

### Test Data Setup

1. **Add Delivery Zones to Supabase:**
```sql
INSERT INTO delivery_zones (name, zip_codes, min_order_amount, delivery_fee, is_active)
VALUES
  ('Zone 1', ARRAY['97201', '97202', '97203'], 25, 0, true),
  ('Zone 2', ARRAY['97204', '97205', '97206'], 40, 5, true),
  ('Zone 3', ARRAY['97207', '97208', '97209'], 60, 10, true);
```

2. **Add Time Slots:**
```sql
INSERT INTO time_slots (date, start_time, end_time, delivery_type, max_orders, current_orders, is_available)
VALUES
  ('2024-12-15', '08:00:00', '10:00:00', 'both', 10, 0, true),
  ('2024-12-15', '10:00:00', '12:00:00', 'both', 10, 0, true),
  ('2024-12-15', '14:00:00', '16:00:00', 'both', 10, 0, true);
```

3. **Test Blackout Dates:**
```sql
INSERT INTO blackout_dates (date, reason)
VALUES ('2024-12-25', 'Christmas - Bakery Closed');
```

---

## FAQ

**Q: How do I change the bakery location shown in pickup?**
A: Edit `PICKUP_LOCATION` constant in `fulfillment-selector.tsx`

**Q: Can I add more delivery zones?**
A: Yes, add them to Supabase. Components automatically fetch from database.

**Q: How do I change lead time requirements?**
A: Modify `leadTimeHours` calculation in `time-slot-picker.tsx`

**Q: Can I customize time slot windows?**
A: Yes, modify slots in database. Component displays any time range.

**Q: What if a slot fills up during checkout?**
A: Call `checkSlotAvailability()` before order creation to verify.

---

## Support

See full documentation: `/src/components/checkout/README.md`

For database schema: Check Happy Sourdough plugin skill `bakery-schema`
