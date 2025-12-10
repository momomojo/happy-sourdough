# Order Confirmation & Tracking System

This document describes the order confirmation and tracking features implemented for Happy Sourdough bakery e-commerce platform.

## Overview

The order confirmation system provides customers with:
- Post-checkout success page with order number
- Real-time order status tracking with visual progress indicators
- Detailed order information and delivery/pickup details
- Webhook integration for Stripe payment confirmation

## Files Created

### 1. Order Data Functions
**File:** `/src/lib/supabase/orders.ts` (181 lines)

Provides server-side functions for retrieving order data:
- `getOrderByNumber(orderNumber)` - Fetch order by order number with full details
- `getOrderById(orderId)` - Fetch order by UUID with full details
- `getOrderItems(orderId)` - Get order line items with product details
- `getOrderStatusHistory(orderId)` - Get status change history with timestamps

Returns `OrderWithDetails` type including items, status history, and delivery window.

### 2. Order Status Tracker Component
**File:** `/src/components/order/order-status-tracker.tsx` (261 lines)

Visual timeline component showing order progress:
- Supports three workflows: delivery, pickup, and custom (with decorating)
- Color-coded status indicators (completed, in-progress, pending)
- Animated progress line
- Displays timestamps for completed steps
- Handles special states (cancelled, refunded)

**Props:**
```typescript
{
  currentStatus: OrderStatus;
  deliveryType: 'pickup' | 'delivery';
  hasDecorating?: boolean;
  statusHistory?: Array<{status: OrderStatus; created_at: string}>;
}
```

**Order Workflows:**
- **Delivery:** received → confirmed → baking → quality_check → ready → out_for_delivery → delivered
- **Pickup:** received → confirmed → baking → quality_check → ready → delivered
- **Custom (with decorating):** includes decorating step between baking and quality_check

### 3. Order Details Component
**File:** `/src/components/order/order-details.tsx` (182 lines)

Displays comprehensive order information in cards:
- Order items list with quantities, prices, and special instructions
- Order totals (subtotal, delivery fee, tax, total)
- Delivery address or pickup location
- Scheduled delivery/pickup date and time window
- Order notes and instructions

**Props:**
```typescript
{
  order: OrderWithDetails;
}
```

### 4. Order Tracking Page
**File:** `/src/app/(shop)/order/[orderNumber]/page.tsx` (107 lines)

Dynamic route for tracking specific orders:
- Fetches order by order number from URL
- Server-rendered for SEO and performance
- Two-column layout: status tracker + order details
- Help section with contact information
- Generates metadata for SEO

**URL Pattern:** `/order/HS-2024-001`

### 5. Order Not Found Page
**File:** `/src/app/(shop)/order/[orderNumber]/not-found.tsx` (50 lines)

Custom 404 page for invalid order numbers:
- Friendly error message
- Links back to shopping and home
- Support contact information

### 6. Order Success Page
**File:** `/src/app/(shop)/order/success/page.tsx` (181 lines)

Post-checkout confirmation page:
- Success animation with checkmark
- Order number display (from URL params)
- Link to order tracking page
- "What happens next" timeline
- Clears shopping cart from localStorage
- Action buttons: Track Order, Continue Shopping, Home

**URL Pattern:** `/order/success?order_number=HS-2024-001&session_id=cs_xxx`

Features:
- Suspense boundary for smooth loading
- Automatic cart clearing after successful checkout
- Dispatches 'cart-cleared' event for real-time UI updates

### 7. Stripe Webhook Handler
**File:** `/src/app/api/webhooks/stripe/route.ts` (207 lines)

Handles Stripe webhook events for order automation:

**Supported Events:**
- `checkout.session.completed` - Updates order to 'confirmed', records payment details
- `payment_intent.payment_failed` - Logs failed payments
- `charge.refunded` - Updates order status to 'refunded', records refund amount

**Security:**
- Verifies Stripe webhook signatures
- Uses Supabase service role for database updates (bypasses RLS)
- Comprehensive error handling and logging

**Database Updates:**
- Updates order status and payment IDs
- Creates order_status_history entries with timestamps
- Handles refund processing automatically

### 8. Database Type Updates
**File:** `/src/types/database.ts` (modified)

Added `OrderStatusHistory` interface:
```typescript
export interface OrderStatusHistory {
  id: string;
  order_id: string;
  status: OrderStatus;
  changed_by: string | null;
  notes: string | null;
  created_at: string;
}
```

## Order Status Enum

The system supports 11 order statuses:

**Active Workflow:**
1. `received` - Initial state when order is placed
2. `confirmed` - Payment confirmed (set by webhook)
3. `baking` - Order is being prepared
4. `decorating` - Custom decoration (cakes/pastries only)
5. `quality_check` - Final inspection
6. `ready` - Ready for pickup/delivery
7. `out_for_delivery` - En route to customer (delivery only)
8. `delivered` - Order completed

**Terminal States:**
9. `cancelled` - Order cancelled
10. `refunded` - Payment refunded (set by webhook)

## Theme & Styling

**Status Colors:**
- Completed steps: Primary color (espresso brown)
- Current step: Amber badge with pulse animation
- Pending steps: Muted gray
- Cancelled: Red
- Refunded: Blue

**Icons (lucide-react):**
- Clock (received)
- CheckCircle2 (confirmed)
- ChefHat (baking)
- Sparkles (decorating)
- ClipboardCheck (quality_check)
- Package (ready)
- Bike (out_for_delivery)
- Home (delivered)
- XCircle (cancelled)
- DollarSign (refunded)

## Integration Requirements

### Environment Variables
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # Required for webhooks

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...    # Required for webhooks
```

### Database Tables Required

**orders** table must have:
- `order_number` (text, unique)
- `status` (order_status enum)
- `delivery_type` (delivery_type enum)
- `stripe_payment_intent_id` (text, nullable)
- `stripe_checkout_session_id` (text, nullable)
- `time_slot_id` (uuid, nullable, FK to time_slots)
- All other fields per database schema

**order_status_history** table:
```sql
CREATE TABLE order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status order_status NOT NULL,
  changed_by UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**time_slots** table must have:
- `date` (date)
- `start_time` (time)
- `end_time` (time)

### Stripe Webhook Setup

1. In Stripe Dashboard, go to Developers → Webhooks
2. Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
3. Select events to listen to:
   - `checkout.session.completed`
   - `payment_intent.payment_failed`
   - `charge.refunded`
4. Copy webhook signing secret to `STRIPE_WEBHOOK_SECRET`

### Testing Webhooks Locally

```bash
# Install Stripe CLI
stripe login

# Forward webhooks to local endpoint
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Trigger test events
stripe trigger checkout.session.completed
stripe trigger charge.refunded
```

## Usage Examples

### Creating Order After Checkout

After Stripe checkout session is created, redirect to success page:

```typescript
const successUrl = `${process.env.NEXT_PUBLIC_APP_URL}/order/success?session_id={CHECKOUT_SESSION_ID}&order_number=${orderNumber}`;
```

### Tracking an Order

Customers can visit:
```
/order/HS-2024-001
```

This page is server-rendered and SEO-friendly.

### Updating Order Status (Admin)

When updating order status, create a status history entry:

```typescript
const supabase = createClient();

// Update order status
await supabase
  .from('orders')
  .update({ status: 'baking' })
  .eq('id', orderId);

// Record history
await supabase
  .from('order_status_history')
  .insert({
    order_id: orderId,
    status: 'baking',
    changed_by: userId,
    notes: 'Started baking'
  });
```

## Key Features

1. **Real-time Status Tracking**: Visual timeline shows order progress with timestamps
2. **Automatic Payment Confirmation**: Webhook updates order when payment succeeds
3. **Automatic Refund Handling**: Webhook updates order when refund is processed
4. **Mobile Responsive**: All components are mobile-friendly
5. **SEO Optimized**: Server-side rendering with metadata
6. **Accessibility**: Semantic HTML, proper ARIA labels, keyboard navigation
7. **Type Safe**: Full TypeScript coverage with strict types

## Next Steps

1. **Email Notifications**: Send confirmation emails on order status changes
2. **SMS Notifications**: Optional SMS updates for delivery status
3. **Push Notifications**: Web push for real-time updates
4. **Admin Dashboard**: Build order management interface
5. **Customer Account**: Link orders to user accounts for order history
6. **Print Receipt**: Generate printable order receipts

## Troubleshooting

**Order not found:**
- Verify order_number is correct (case-sensitive)
- Check database for order existence
- Ensure RLS policies allow read access

**Webhook not updating order:**
- Verify `STRIPE_WEBHOOK_SECRET` is correct
- Check webhook signature verification
- Review server logs for errors
- Ensure `SUPABASE_SERVICE_ROLE_KEY` is set

**Status history not showing timestamps:**
- Verify `order_status_history` entries exist
- Check that `created_at` is populated
- Ensure status values match enum exactly

## Dependencies

All required dependencies are already in package.json:
- `@stripe/stripe-js` - Stripe client
- `stripe` - Stripe server SDK
- `@supabase/supabase-js` - Supabase client
- `date-fns` - Date formatting
- `lucide-react` - Icons
- `shadcn/ui` - UI components
