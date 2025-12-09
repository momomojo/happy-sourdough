# Delivery Scheduling System

This directory contains the complete delivery scheduling system for Happy Sourdough bakery e-commerce.

## Components

### 1. FulfillmentSelector
**File:** `fulfillment-selector.tsx`

Radio selection for choosing between pickup and delivery.

**Props:**
- `value: DeliveryType` - Current selection ('pickup' | 'delivery')
- `onChange: (type: DeliveryType) => void` - Callback when selection changes

**Features:**
- Visual pickup location information
- Delivery zone fee breakdown
- Responsive card layout

---

### 2. DeliveryZoneChecker
**File:** `delivery-zone-checker.tsx`

Zip code validator that checks delivery availability and shows zone information.

**Props:**
- `subtotal: number` - Current cart subtotal
- `onZoneChange: (zone: DeliveryZone | null) => void` - Callback when zone is validated

**Features:**
- Real-time zip code validation against Supabase
- Shows delivery fee, minimum order, and estimated time
- Free delivery threshold messaging
- Visual feedback for zone availability
- Minimum order warnings

**Delivery Zones:**
- Zone 1 (0-3mi): $25 min, Free delivery
- Zone 2 (3-7mi): $40 min, $5 fee (free over $75)
- Zone 3 (7-12mi): $60 min, $10 fee (free over $100)

---

### 3. TimeSlotPicker
**File:** `time-slot-picker.tsx`

Date and time window selection with blackout date handling.

**Props:**
- `deliveryType: DeliveryType` - Type of fulfillment
- `onSlotSelect: (slot: TimeSlot | null, date: Date | null) => void` - Callback when slot is selected
- `hasCake?: boolean` - Whether order contains custom cake (requires 48h lead time)

**Features:**
- Calendar with next 14 days booking window
- Blackout dates disabled automatically
- Lead time enforcement (24h standard, 48h for cakes)
- Real-time slot availability (X of Y remaining)
- 2-hour time windows from 8am-6pm
- Filters slots by pickup/delivery type
- Mobile-friendly date picker

---

### 4. DeliverySummary
**File:** `delivery-summary.tsx`

Shows complete fulfillment details with delivery fee breakdown.

**Props:**
- `deliveryType: DeliveryType` - Type of fulfillment
- `deliveryZone: DeliveryZone | null` - Selected delivery zone (if delivery)
- `timeSlot: TimeSlot | null` - Selected time slot
- `selectedDate: Date | null` - Selected date
- `subtotal: number` - Current cart subtotal

**Features:**
- Selected date and time window display
- Delivery fee calculation (or "Free")
- Estimated arrival time
- Pickup location information
- Minimum order warnings
- Free delivery upsell messaging

---

### 5. CheckoutFulfillmentFlow (Example Integration)
**File:** `checkout-fulfillment-flow.tsx`

Complete integrated flow showing how to use all components together.

**Props:**
- `subtotal: number` - Current cart subtotal
- `hasCake?: boolean` - Whether order contains custom cake
- `onFulfillmentComplete?: (data) => void` - Callback with complete fulfillment data

**Example Usage:**
```tsx
import { CheckoutFulfillmentFlow } from '@/components/checkout/checkout-fulfillment-flow';

export default function CheckoutPage() {
  const [fulfillmentData, setFulfillmentData] = useState(null);

  return (
    <CheckoutFulfillmentFlow
      subtotal={75.50}
      hasCake={false}
      onFulfillmentComplete={(data) => {
        setFulfillmentData(data);
        // data.isValid - ready to proceed
        // data.deliveryFee - calculated fee
        // data.timeSlot - selected slot
        // data.selectedDate - selected date
        // data.deliveryZone - zone (if delivery)
      }}
    />
  );
}
```

---

## Data Layer

### Database Functions
**File:** `src/lib/supabase/delivery.ts`

#### getDeliveryZoneByZip(zipCode)
Fetches delivery zone by zip code from `delivery_zones` table.

#### getAvailableTimeSlots(date, type)
Returns available time slots for a date, filtered by delivery type and capacity.

#### getBlackoutDates()
Returns all blackout dates from now onwards.

#### checkSlotAvailability(slotId)
Real-time availability check for a specific slot.

#### getTimeSlotsForRange(startDate, endDate, type?)
Pre-load slots for multiple days.

#### reserveTimeSlot(slotId)
Increments current_orders when order is created.

#### releaseTimeSlot(slotId)
Decrements current_orders when order is cancelled.

---

### Utility Functions
**File:** `src/lib/delivery-zones.ts`

#### calculateActualDeliveryFee(zone, subtotal)
Calculates delivery fee with free delivery thresholds applied.

#### isMinimumMet(zone, subtotal)
Checks if subtotal meets zone minimum order amount.

#### getEstimatedDeliveryTime(zone)
Returns estimated delivery time in minutes based on zone.

#### formatDeliveryTime(minutes)
Formats minutes into human-readable time (e.g., "45 minutes", "1 hour 15 minutes").

#### getFreeDeliveryThreshold(zone)
Returns the subtotal threshold for free delivery for a zone.

---

## Database Tables

### delivery_zones
```sql
- id (int)
- name (text)
- zip_codes (text[])
- min_order_amount (numeric)
- delivery_fee (numeric)
- free_delivery_threshold (numeric)
- estimated_time_minutes (int)
- is_active (boolean)
```

### time_slots
```sql
- id (uuid)
- date (date)
- start_time (time)
- end_time (time)
- delivery_type (enum: 'pickup' | 'delivery' | 'both')
- max_orders (int)
- current_orders (int)
- is_available (boolean)
```

### blackout_dates
```sql
- id (uuid)
- date (date)
- reason (text)
```

---

## Business Rules

1. **Lead Time:** Orders require 24h advance notice (48h for custom cakes)
2. **Booking Window:** Customers can book up to 14 days in advance
3. **Time Slots:** 2-hour windows, typically 8am-6pm
4. **Slot Capacity:** Real-time tracking prevents overbooking
5. **Delivery Zones:**
   - Zone 1: Always free delivery
   - Zone 2: Free delivery over $75
   - Zone 3: Free delivery over $100

---

## Type Definitions

All components use TypeScript types from `@/types/database`:

```typescript
type DeliveryType = 'pickup' | 'delivery';

interface DeliveryZone {
  id: number;
  name: string;
  zip_codes?: string[];
  min_order_amount: number;
  delivery_fee: number;
  free_delivery_threshold?: number;
  estimated_time_minutes?: number;
  is_active: boolean;
}

interface TimeSlot {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  delivery_type: DeliveryType;
  max_orders: number;
  current_orders: number;
  is_available: boolean;
}
```

---

## Styling

All components use shadcn/ui with Happy Sourdough theme:
- Responsive mobile-first design
- Accessible form controls
- Visual feedback for validation
- Consistent card-based layouts
- Primary color: Espresso brown
- Secondary color: Crust orange
- Accent color: Honey gold

---

## Dependencies

- **UI Components:** shadcn/ui (Radio Group, Calendar, Popover, Card, Badge, etc.)
- **Icons:** lucide-react
- **Date Handling:** date-fns
- **Database:** Supabase client
- **Styling:** Tailwind CSS

---

## Installation

All required shadcn components have been installed:
```bash
npx shadcn@latest add radio-group calendar popover
```

---

## Future Enhancements

Potential additions:
- Address autocomplete integration
- Map view of delivery zones
- Preferred time slot saving
- SMS notifications for slot availability
- Dynamic pricing based on demand
- Group order coordination
