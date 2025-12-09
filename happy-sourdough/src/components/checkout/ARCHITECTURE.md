# Delivery Scheduling System Architecture

## Component Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    CHECKOUT PAGE (Your Code)                     │
│                                                                   │
│  State: cartSubtotal, hasCustomCake, fulfillmentData            │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│              CheckoutFulfillmentFlow (Optional Wrapper)          │
│                                                                   │
│  • Manages overall state                                         │
│  • Orchestrates component flow                                   │
│  • Validates completion                                          │
│  • Provides callback with complete data                          │
└───────────────────────────┬─────────────────────────────────────┘
                            │
            ┌───────────────┼───────────────┐
            ▼               ▼               ▼
    ┌───────────┐   ┌──────────────┐   ┌─────────────┐
    │   STEP 1  │   │    STEP 2    │   │   STEP 3    │
    └───────────┘   └──────────────┘   └─────────────┘
```

---

## Step-by-Step Component Flow

### STEP 1: Fulfillment Method Selection

```
┌──────────────────────────────────────────────────────────┐
│            FulfillmentSelector Component                 │
│                                                           │
│  ┌─────────────────────────────────────────────────┐   │
│  │  ○ Pickup                                        │   │
│  │    Happy Sourdough Bakery                        │   │
│  │    123 Main Street                               │   │
│  │    Portland, OR 97201                            │   │
│  │    Free - No delivery fee                        │   │
│  └─────────────────────────────────────────────────┘   │
│                                                           │
│  ┌─────────────────────────────────────────────────┐   │
│  │  ● Delivery                                      │   │
│  │    Fresh bread delivered to your door            │   │
│  │    Zone 1: $25 min, Free                         │   │
│  │    Zone 2: $40 min, $5 fee (free over $75)      │   │
│  │    Zone 3: $60 min, $10 fee (free over $100)    │   │
│  └─────────────────────────────────────────────────┘   │
│                                                           │
│  Props: value, onChange                                  │
│  Output: DeliveryType ('pickup' | 'delivery')           │
└──────────────────────────────────────────────────────────┘
```

---

### STEP 2: Delivery Zone Validation (if delivery selected)

```
┌──────────────────────────────────────────────────────────┐
│          DeliveryZoneChecker Component                   │
│                                                           │
│  Delivery Zip Code:                                      │
│  ┌──────────┐  ┌──────────────┐                         │
│  │  97201   │  │ Check Zone ▶ │                         │
│  └──────────┘  └──────────────┘                         │
│                                                           │
│  ┌─────────────────────────────────────────────────┐   │
│  │ ✓ Zone 1 - Downtown            Free Delivery    │   │
│  │                                                   │   │
│  │ $ Minimum Order:      $25.00 ✓                  │   │
│  │ 🚚 Delivery Fee:      Free                       │   │
│  │ 📍 Estimated Time:    30 minutes                 │   │
│  └─────────────────────────────────────────────────┘   │
│                                                           │
│  Data Flow:                                              │
│  1. User enters zip → 97201                             │
│  2. Query Supabase → getDeliveryZoneByZip()            │
│  3. Display zone info → Zone 1                          │
│  4. Callback to parent → onZoneChange(zone)             │
│                                                           │
│  Props: subtotal, onZoneChange                          │
│  Output: DeliveryZone | null                            │
└──────────────────────────────────────────────────────────┘
```

---

### STEP 3: Date & Time Slot Selection

```
┌──────────────────────────────────────────────────────────┐
│            TimeSlotPicker Component                      │
│                                                           │
│  Select Date:                                            │
│  ┌─────────────────────────────────┐                    │
│  │  📅 Friday, December 15, 2024   │ ▼                  │
│  └─────────────────────────────────┘                    │
│                                                           │
│  Opens Calendar Popover:                                 │
│  ┌─────────────────────────────────┐                    │
│  │   December 2024                  │                    │
│  │  S  M  T  W  T  F  S            │                    │
│  │              1  2  3  4          │                    │
│  │  5  6  7  8  9 10 11            │                    │
│  │ 12 13 14 [15] 16 17 18          │ ← Selected         │
│  │ 19 20 21  22  23 24 [25]        │ ← Blackout         │
│  │ 26 27 28  29  30 31             │                    │
│  └─────────────────────────────────┘                    │
│                                                           │
│  Select Time Window:                                     │
│  ┌─────────────────────────────────────────┐            │
│  │ 🕐 8:00 AM - 10:00 AM                   │            │
│  │    8 of 10 spots remaining              │            │
│  └─────────────────────────────────────────┘            │
│                                                           │
│  ┌─────────────────────────────────────────┐            │
│  │ 🕐 10:00 AM - 12:00 PM      [Limited]   │ ← Selected │
│  │    2 of 10 spots remaining              │            │
│  └─────────────────────────────────────────┘            │
│                                                           │
│  ┌─────────────────────────────────────────┐            │
│  │ 🕐 2:00 PM - 4:00 PM                    │            │
│  │    5 of 10 spots remaining              │            │
│  └─────────────────────────────────────────┘            │
│                                                           │
│  Data Flow:                                              │
│  1. Load blackout dates → getBlackoutDates()           │
│  2. User selects date → Dec 15                          │
│  3. Query slots → getAvailableTimeSlots()              │
│  4. User selects slot → 10:00 AM - 12:00 PM            │
│  5. Callback to parent → onSlotSelect(slot, date)       │
│                                                           │
│  Props: deliveryType, onSlotSelect, hasCake             │
│  Output: TimeSlot | null, Date | null                   │
└──────────────────────────────────────────────────────────┘
```

---

### STEP 4: Summary Display

```
┌──────────────────────────────────────────────────────────┐
│             DeliverySummary Component                    │
│                                                           │
│  Delivery Details                    [Free Delivery]     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━    │
│                                                           │
│  📅 Date                                                 │
│     Friday, December 15, 2024                            │
│                                                           │
│  🕐 Time Window                                          │
│     10:00 AM - 12:00 PM                                  │
│  ────────────────────────────────────────────           │
│  📍 Delivery Zone                                        │
│     Zone 1 - Downtown                                    │
│                                                           │
│  🚚 Estimated Arrival                                    │
│     10:30 AM                                             │
│     Typical delivery time: 30 minutes                    │
│                                                           │
│  💵 Delivery Fee                                         │
│     Free delivery                                        │
│  ────────────────────────────────────────────           │
│                                                           │
│  Props: deliveryType, deliveryZone, timeSlot,           │
│         selectedDate, subtotal                           │
│  Output: Visual display only (no callbacks)             │
└──────────────────────────────────────────────────────────┘
```

---

## Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      SUPABASE DATABASE                       │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │delivery_zones│  │  time_slots  │  │blackout_dates│     │
│  │              │  │              │  │              │     │
│  │ • id         │  │ • id         │  │ • id         │     │
│  │ • name       │  │ • date       │  │ • date       │     │
│  │ • zip_codes[]│  │ • start_time │  │ • reason     │     │
│  │ • min_order  │  │ • end_time   │  └──────────────┘     │
│  │ • fee        │  │ • type       │                        │
│  └──────────────┘  │ • max_orders │                        │
│                    │ • current    │                        │
│                    │ • available  │                        │
│                    └──────────────┘                        │
└──────────────┬───────────┬─────────────┬──────────────────┘
               │           │             │
               ▼           ▼             ▼
┌─────────────────────────────────────────────────────────────┐
│              src/lib/supabase/delivery.ts                    │
│                                                               │
│  • getDeliveryZoneByZip(zip)                                │
│  • getAvailableTimeSlots(date, type)                        │
│  • getBlackoutDates()                                       │
│  • checkSlotAvailability(slotId)                            │
│  • reserveTimeSlot(slotId)                                  │
│  • releaseTimeSlot(slotId)                                  │
└──────────────┬──────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────┐
│             src/lib/delivery-zones.ts                        │
│                                                               │
│  • calculateActualDeliveryFee(zone, subtotal)               │
│  • isMinimumMet(zone, subtotal)                             │
│  • getEstimatedDeliveryTime(zone)                           │
│  • formatDeliveryTime(minutes)                              │
│  • getFreeDeliveryThreshold(zone)                           │
└──────────────┬──────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────┐
│                  REACT COMPONENTS                            │
│                                                               │
│  DeliveryZoneChecker → queries zones                        │
│  TimeSlotPicker → queries slots & blackouts                 │
│  DeliverySummary → calculates fees & times                  │
└─────────────────────────────────────────────────────────────┘
```

---

## State Management Flow

```
User Interaction → Component State → Parent Callback → Checkout State

Example Flow:
═════════════

1. User selects "Delivery"
   ├─ FulfillmentSelector updates internal state
   ├─ Calls onChange('delivery')
   └─ Parent updates deliveryType state

2. User enters zip "97201"
   ├─ DeliveryZoneChecker queries Supabase
   ├─ Receives Zone 1 data
   ├─ Updates internal zone state
   ├─ Calls onZoneChange(zone1)
   └─ Parent updates deliveryZone state

3. User selects date "Dec 15"
   ├─ TimeSlotPicker queries available slots
   ├─ Updates internal selectedDate state
   ├─ Calls onSlotSelect(null, date)
   └─ Parent updates selectedDate state

4. User selects slot "10:00 AM - 12:00 PM"
   ├─ TimeSlotPicker updates internal selectedSlot state
   ├─ Calls onSlotSelect(slot, date)
   └─ Parent updates both timeSlot and selectedDate

5. DeliverySummary displays all data
   ├─ Receives all props from parent
   ├─ Calculates delivery fee
   ├─ Calculates estimated arrival
   └─ Renders summary (no state/callbacks)

6. Parent calls onFulfillmentComplete callback
   └─ Returns complete validated data to checkout page
```

---

## Validation Logic Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    VALIDATION CHECKS                         │
└─────────────────────────────────────────────────────────────┘

1. Fulfillment Type Selected?
   ├─ YES → Proceed to step 2
   └─ NO → isValid = false

2. If Delivery: Zone Valid?
   ├─ YES → Zone has minimum met?
   │   ├─ YES → Proceed to step 3
   │   └─ NO → Show warning, isValid = false
   └─ NO → Show error, isValid = false

3. Date Selected?
   ├─ YES → Is within booking window?
   │   ├─ YES → Is not blackout date?
   │   │   ├─ YES → Proceed to step 4
   │   │   └─ NO → Disable date
   │   └─ NO → Disable date
   └─ NO → isValid = false

4. Time Slot Selected?
   ├─ YES → Has availability?
   │   ├─ YES → isValid = true ✓
   │   └─ NO → Disable slot
   └─ NO → isValid = false

5. Calculate Final Fees
   ├─ Delivery fee = calculateActualDeliveryFee()
   ├─ Check free delivery threshold
   └─ Return complete data with isValid flag
```

---

## Error Handling Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                    ERROR SCENARIOS                           │
└─────────────────────────────────────────────────────────────┘

1. Zip Code Not Serviced
   ├─ Display: "Sorry, we do not deliver to this zip code yet"
   ├─ Zone = null
   ├─ Prevent proceeding to time slot
   └─ Suggest: Pickup option

2. Minimum Order Not Met
   ├─ Display: "Add $X.XX more to meet minimum"
   ├─ Show in red warning box
   ├─ Zone info still visible
   └─ Can still select time slot (but isValid = false)

3. No Slots Available
   ├─ Display: "No time slots available for this date"
   ├─ Suggest: Select different date
   └─ Show upcoming dates with availability

4. Slot Filled During Checkout
   ├─ Check availability before order creation
   ├─ Display: "This time slot is no longer available"
   ├─ Force re-selection
   └─ Update slot list

5. Network/Database Error
   ├─ Try/catch in all async functions
   ├─ Log to console.error()
   ├─ Display: "Unable to load data. Please try again."
   └─ Provide retry button
```

---

## Performance Considerations

```
┌─────────────────────────────────────────────────────────────┐
│                   OPTIMIZATION STRATEGIES                    │
└─────────────────────────────────────────────────────────────┘

1. Data Fetching
   ├─ Blackout dates: Load once on mount
   ├─ Delivery zones: Cache after first lookup
   ├─ Time slots: Load per date (not all dates)
   └─ Use React Query/SWR for caching (optional)

2. Component Rendering
   ├─ Each component manages own state
   ├─ Only re-render on prop changes
   ├─ DeliverySummary is pure display (no state)
   └─ Use React.memo for expensive components (optional)

3. Database Queries
   ├─ Index zip_codes array in delivery_zones
   ├─ Composite index on (date, delivery_type) in time_slots
   ├─ Filter by is_available at database level
   └─ Use .single() when expecting one result

4. User Experience
   ├─ Show loading states (Loader2 spinner)
   ├─ Disable inputs during async operations
   ├─ Progressive disclosure (step-by-step)
   └─ Instant feedback on validation
```

---

## Integration Points

```
┌─────────────────────────────────────────────────────────────┐
│              WHERE THIS SYSTEM CONNECTS                      │
└─────────────────────────────────────────────────────────────┘

1. Checkout Page
   ├─ Imports: CheckoutFulfillmentFlow
   ├─ Provides: cartSubtotal, hasCustomCake
   └─ Receives: Complete fulfillment data

2. Order Creation
   ├─ Uses: fulfillmentData from callback
   ├─ Saves: delivery_type, delivery_zone_id, time_slot_id
   ├─ Calls: reserveTimeSlot(slotId)
   └─ Creates: Order in database

3. Stripe Checkout
   ├─ Includes: deliveryFee in line items
   ├─ Metadata: time_slot_id, delivery_zone_id
   └─ Success: Creates order with slot reservation

4. Order Management
   ├─ Cancellation: Calls releaseTimeSlot()
   ├─ Modification: Release old + Reserve new
   └─ Admin: View all orders per slot

5. Customer Portal
   ├─ Display: Selected date/time in order history
   ├─ Show: Estimated arrival time
   └─ Allow: Modification (if early enough)
```

This architecture provides a complete, production-ready delivery scheduling system with clear separation of concerns, robust error handling, and excellent user experience.
