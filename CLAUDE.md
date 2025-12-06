# Happy Sourdough - Bakery E-commerce Platform

## IMPORTANT: Documentation Lookup

**Always use Context7 MCP for up-to-date documentation when working on this project.**

Before implementing features, look up current docs for:
- Next.js: `mcp__MCP_DOCKER__get-library-docs` with `/vercel/next.js`
- Supabase: `mcp__MCP_DOCKER__get-library-docs` with `/supabase/supabase`
- Stripe: `mcp__MCP_DOCKER__get-library-docs` with `/stripe/stripe-node`
- Tailwind: `mcp__MCP_DOCKER__get-library-docs` with `/tailwindlabs/tailwindcss`
- shadcn/ui: `mcp__MCP_DOCKER__get-library-docs` with `/shadcn-ui/ui`

Use `mcp__MCP_DOCKER__resolve-library-id` first if unsure of the exact library ID.

---

## Project Overview
Happy Sourdough is a local artisan bakery e-commerce platform built with Next.js 15, Supabase, and Stripe. The platform enables customers to order fresh bread, pastries, and custom cakes with scheduled delivery or pickup.

## Tech Stack
- **Framework**: Next.js 15 (App Router, Server Actions)
- **Database**: Supabase (PostgreSQL + Auth + Edge Functions)
- **Payments**: Stripe (Checkout, Webhooks)
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Hosting**: Vercel
- **Email**: Resend (transactional emails)

## Available Skills (Happy Sourdough Plugin)

Load these skills using the Skill tool for domain-specific guidance:

| Skill | When to Use | Command |
|-------|-------------|---------|
| `happy-sourdough:bakery-schema` | Database work, migrations, RLS policies | `Skill: "happy-sourdough:bakery-schema"` |
| `happy-sourdough:delivery-zones` | Delivery logic, fee calculations | `Skill: "happy-sourdough:delivery-zones"` |
| `happy-sourdough:order-workflow` | Order status, checkout, refunds | `Skill: "happy-sourdough:order-workflow"` |
| `happy-sourdough:shadcn-bakery-ui` | UI components, theme, styling | `Skill: "happy-sourdough:shadcn-bakery-ui"` |
| `happy-sourdough:production-lists` | Admin bake lists, inventory | `Skill: "happy-sourdough:production-lists"` |

## Database Schema

### Core Tables
- `products` - Bakery products (breads, pastries, cakes)
- `product_variants` - Size/flavor variants with pricing
- `orders` - Customer orders with 11-state workflow
- `order_items` - Line items for each order
- `delivery_zones` - Geographic zones with fee rules
- `time_slots` - Available pickup/delivery windows
- `customer_profiles` - Extended user profiles
- `loyalty` - Points and rewards tracking

### Order Status Flow
```
received → confirmed → baking → decorating → quality_check → ready → out_for_delivery → delivered
                                                                  ↓
                                                           [pickup: ready → delivered]
Any state can transition to: cancelled, refunded
```

## Delivery Zones

| Zone | Radius | Min Order | Delivery Fee |
|------|--------|-----------|--------------|
| 1 | 0-3 mi | $25 | Free |
| 2 | 3-7 mi | $40 | $5 |
| 3 | 7-12 mi | $60 | $10 |

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (shop)/            # Customer-facing pages
│   │   ├── page.tsx       # Homepage
│   │   ├── products/      # Product catalog
│   │   ├── cart/          # Shopping cart
│   │   └── checkout/      # Checkout flow
│   ├── (admin)/           # Admin dashboard
│   │   ├── orders/        # Order management
│   │   ├── products/      # Product management
│   │   └── production/    # Daily bake lists
│   ├── api/               # API routes
│   │   ├── webhooks/      # Stripe webhooks
│   │   └── ...
│   └── layout.tsx
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── shop/              # Shop-specific components
│   └── admin/             # Admin-specific components
├── lib/
│   ├── supabase/          # Supabase client & helpers
│   ├── stripe/            # Stripe utilities
│   ├── delivery-zones.ts  # Zone calculations
│   └── order-workflow.ts  # Order state machine
└── types/                 # TypeScript definitions
```

## Coding Conventions

### TypeScript
- Use strict mode
- Define types for all Supabase tables in `types/database.ts`
- Use Zod for runtime validation

### Components
- Use Server Components by default
- Add `'use client'` only when needed (interactivity, hooks)
- Follow shadcn/ui patterns for consistent styling

### Database
- Always use RLS policies (never bypass with service role in client code)
- Use parameterized queries to prevent SQL injection
- Follow the order status enum exactly

### Theme Colors (from shadcn-bakery-ui skill)
```css
--primary: 24 9.8% 10%;      /* Espresso brown */
--secondary: 30 80% 55%;      /* Crust orange */
--accent: 38 92% 50%;         /* Honey gold */
--background: 60 9.1% 97.8%;  /* Cream */
```

## Environment Variables

Required in `.env.local`:
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## MCP Servers Available

- **github**: PR management, issues, code review
- **playwright**: E2E testing, visual screenshots
- **stripe**: Payment operations, refunds
- **database-server**: Direct Supabase queries (configure in .mcp.json)

## Quick Commands

```bash
# Development
npm run dev

# Build
npm run build

# Lint
npm run lint

# Type check
npx tsc --noEmit
```

## Key Business Rules

1. **Orders**: Minimum order varies by delivery zone
2. **Cancellation**: Not allowed once baking starts
3. **Refunds**: Only within 24 hours of delivery
4. **Custom cakes**: Require 48-hour advance notice
5. **Delivery windows**: 2-hour slots, 7am-7pm

## Getting Started

1. Set up Supabase project and add credentials to `.env.local`
2. Run migrations from `happy-sourdough:bakery-schema` skill
3. Set up Stripe test account and add credentials
4. Run `npm run dev` to start development

---

## ⚠️ CODEBASE STATUS (Last Reviewed: 2025-12-06)

**Status: NOT PRODUCTION READY - Critical Schema Mismatches**

### Critical Issues Requiring Immediate Fix

| Issue | Location | Impact |
|-------|----------|--------|
| `variant_id` vs `product_variant_id` | `src/app/api/checkout/route.ts:180`, types | Order item creation fails |
| `delivery_type` vs `fulfillment_type` | `types/database.ts:93`, all order code | Order queries fail |
| `tax` vs `tax_amount` | Order type & checkout | Order total calculations wrong |
| `slot_type` vs `delivery_type` | `lib/supabase/delivery.ts:57,143` | Time slot filtering fails |
| `window_start/end` vs `start_time/end_time` | `lib/supabase/delivery.ts:58` | Time slot queries fail |
| `price_adjustment` vs `price` | ProductVariant type | Variant pricing broken |
| `delivery_zones.id` UUID vs numeric | Types + checkout route | Zone lookups fail |
| `min_order` vs `min_order_amount` | DeliveryZone type | Minimum order checks fail |
| Guest user `user_id: 'guest'` | checkout route:67 | FK constraint violation |
| Missing `stripe_checkout_session_id` column | Schema vs code | Session tracking fails |
| Missing `picked_up` status in types | OrderStatus type | Status enum incomplete |
| Missing `decrement_slot_orders` RPC | Schema functions | Slot release fails |

### Incomplete Features
- **Homepage**: Default Next.js placeholder (not bakery-branded)
- **Discount codes**: TODO comment, not implemented
- **Admin user tracking**: Status history `changed_by` always null
- **Time slot reservation**: Not called during checkout

### Code Quality Notes
- 23 instances of `as any` type casting (type safety gaps)
- Hardcoded 8% tax rate (should be configurable)
- Hardcoded ZIP-to-zone mapping (mock data)
- Email send failures don't block order completion

---

## 🗺️ MASTER PLAN: Production-Ready Roadmap

### Phase 1: Fix Critical Blockers (Before Any Feature Work)
**Goal**: Make existing vibe-coded features actually work

1. **Schema Alignment**
   - Update `types/database.ts` to match actual SQL schema exactly
   - Fix all field name mismatches across codebase
   - Add missing `stripe_checkout_session_id` to schema OR remove from code
   - Add `picked_up` to OrderStatus type
   - Add `decrement_slot_orders` RPC function to schema

2. **Guest Checkout Fix**
   - Use nullable `user_id` with `guest_email` for anonymous orders
   - Update order creation to handle both authenticated and guest

3. **Remove Type Casting**
   - Replace `as any` with proper types throughout
   - Ensure TypeScript strict mode catches all issues

4. **Validation**: Run `npx tsc --noEmit` with zero errors

### Phase 2: Core Flow Validation
**Goal**: End-to-end checkout works with real Supabase + Stripe

1. **Checkout Flow**
   - Products → Add to Cart → Checkout form → Stripe → Webhook → Confirmation
   - Time slot reservation on order creation
   - Proper error handling and rollback

2. **Admin Order Management**
   - View orders, update status, track history
   - Production list generation works

3. **E2E Tests Pass**
   - All 4 test suites green: products, cart, checkout, admin
   - CI pipeline runs successfully

### Phase 3: Homepage & Polish
**Goal**: Customer-facing experience complete

1. **Bakery Homepage**
   - Hero with bakery branding
   - Featured products carousel
   - Categories navigation
   - Opening hours / About section

2. **Mobile Optimization**
   - Test all flows on mobile viewports
   - Bottom sheet checkout on mobile

3. **Email Templates**
   - Verify all 3 email templates render correctly
   - Test with real Resend in staging

### Phase 4: Feature Expansion (Post-Stable)
**Goal**: Add business-critical features with regression tests

Each feature follows: Design → Implement → Test → Deploy

| Feature | Priority | Dependencies |
|---------|----------|--------------|
| Discount/promo codes | High | Checkout stable |
| Customer accounts | High | Auth flow |
| Order history for customers | High | Customer accounts |
| Loyalty program | Medium | Customer accounts |
| Product inventory tracking | Medium | Admin dashboard |
| Custom cake ordering | Medium | Lead time logic |
| Multiple pickup locations | Low | Zone logic |
| Subscription/recurring orders | Low | Stripe subscriptions |

### Phase 5: Production Hardening
**Goal**: Ready for real traffic

1. **Security Audit**
   - RLS policies tested
   - Input sanitization on all forms
   - Rate limiting on APIs

2. **Monitoring & Logging**
   - Error tracking (Sentry or similar)
   - Webhook delivery monitoring
   - Performance metrics

3. **Documentation**
   - API documentation
   - Admin user guide
   - Runbook for common issues

---

## 🧪 Testing Strategy

### E2E Coverage Requirements
| Flow | File | Status |
|------|------|--------|
| Product browsing | `tests/e2e/products.spec.ts` | ✅ Exists |
| Cart operations | `tests/e2e/cart.spec.ts` | ✅ Exists |
| Checkout flow | `tests/e2e/checkout.spec.ts` | ✅ Exists |
| Admin dashboard | `tests/e2e/admin.spec.ts` | ✅ Exists |
| Order tracking | - | ❌ Needs creation |
| Email delivery | - | ❌ Needs creation |

### Regression Testing Protocol
Before merging any feature:
1. Run `npm run build` - must pass
2. Run `npx tsc --noEmit` - zero errors
3. Run `npm run lint` - no new warnings
4. Run `npm run test:e2e` - all tests pass
5. Manual smoke test of checkout flow

---

## 📋 Current Sprint Focus

**Active Work**: Phase 1 - Schema Alignment

Priority order for fixes:
1. `types/database.ts` - Single source of truth matching SQL
2. `src/app/api/checkout/route.ts` - Order creation works
3. `src/lib/supabase/delivery.ts` - Time slot queries work
4. `supabase/migrations/004_fixes.sql` - Add missing DB objects
5. All other files using wrong field names
