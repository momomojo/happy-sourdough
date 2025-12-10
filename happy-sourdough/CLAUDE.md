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

## Stripe Webhook Testing (Local Development)

### Install Stripe CLI

```bash
# macOS (Homebrew)
brew install stripe/stripe-cli/stripe

# Windows (Scoop)
scoop install stripe

# Linux (via dpkg)
curl -s https://packages.stripe.dev/api/security/keypair/stripe-cli-gpg/public | gpg --dearmor | sudo tee /usr/share/keyrings/stripe.gpg
echo "deb [signed-by=/usr/share/keyrings/stripe.gpg] https://packages.stripe.dev/stripe-cli-debian-local stable main" | sudo tee -a /etc/apt/sources.list.d/stripe.list
sudo apt update && sudo apt install stripe
```

### Login & Forward Webhooks

```bash
# 1. Login to Stripe (opens browser)
stripe login

# 2. Forward webhooks to your local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Output will show: whsec_... (copy this!)
```

### Update .env.local

```bash
# Add the webhook secret from `stripe listen` output
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Test Webhook Events

```bash
# In a separate terminal, trigger test events:
stripe trigger checkout.session.completed
stripe trigger payment_intent.succeeded
stripe trigger charge.refunded
```

### Webhook Handler Location
- **File**: `src/app/api/webhooks/stripe/route.ts`
- **Events handled**: `checkout.session.completed`, `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`

## Getting Started

1. Set up Supabase project and add credentials to `.env.local`
2. Run migrations from `happy-sourdough:bakery-schema` skill
3. Set up Stripe test account and add credentials
4. Install Stripe CLI and run `stripe listen` (see above)
5. Run `npm run dev` to start development

---

## ✅ CODEBASE STATUS (Last Reviewed: 2025-12-10)

**Status: FUNCTIONAL - Core Features Working**

### Completed Fixes (Phase 1 Complete)

All critical schema mismatches have been resolved:

| Issue | Status | Resolution |
|-------|--------|------------|
| `variant_id` vs `product_variant_id` | ✅ Fixed | Types and code use `product_variant_id` |
| `delivery_type` vs `fulfillment_type` | ✅ Fixed | All code uses `fulfillment_type` |
| `tax` vs `tax_amount` | ✅ Fixed | All code uses `tax_amount` |
| `slot_type` / `window_start/end` | ✅ Fixed | Types match schema exactly |
| `price_adjustment` vs `price` | ✅ Fixed | Uses `price_adjustment` |
| `delivery_zones.id` type | ✅ Fixed | UUID as string |
| `min_order` vs `min_order_amount` | ✅ Fixed | Uses `min_order` |
| Guest checkout FK violation | ✅ Fixed | Uses `null` for guest `user_id` |
| `stripe_checkout_session_id` column | ✅ Fixed | Added via migration 004 |
| `picked_up` status | ✅ Fixed | Exists in schema and types |
| `decrement_slot_orders` RPC | ✅ Fixed | Added via migration 004 |

### Implemented Features
- **Homepage**: Bakery-branded with hero, featured products, categories
- **Discount codes**: Full implementation with validation API
- **Customer accounts**: Profile management, order history, saved addresses
- **Admin dashboard**: Orders, products, discounts management
- **Time slot reservation**: Called during checkout with rollback support

### Remaining Code Quality Items
- ~6 instances of `as any`/`as never` type casting (all are necessary Supabase SSR client workarounds for RPC calls)
- Hardcoded 8% tax rate (configurable via business_settings table)
- ZIP-to-zone mapping via delivery_zones table (3 zones seeded)
- Email send failures don't block order completion (by design)

---

## 🗺️ MASTER PLAN: Production-Ready Roadmap

### Phase 1: Fix Critical Blockers ✅ COMPLETE
**Goal**: Make existing vibe-coded features actually work

- ✅ Schema alignment - `types/database.ts` matches SQL schema
- ✅ All field name mismatches fixed across codebase
- ✅ `stripe_checkout_session_id` column added via migration
- ✅ `picked_up` status exists in OrderStatus type
- ✅ `decrement_slot_orders` RPC function added
- ✅ Guest checkout uses nullable `user_id` with `guest_email`
- ✅ TypeScript builds with zero errors (`npm run build` passes)

### Phase 2: Core Flow Validation ✅ COMPLETE
**Goal**: End-to-end checkout works with real Supabase + Stripe

- ✅ Checkout flow: Products → Cart → Checkout → Stripe → Webhook → Confirmation
- ✅ Time slot reservation on order creation with rollback
- ✅ Admin order management: view, update status, track history
- ✅ E2E tests: 31 passed, 20 skipped (admin tests require setup)

### Phase 3: Homepage & Polish ✅ COMPLETE
**Goal**: Customer-facing experience complete

- ✅ Bakery homepage with hero, featured products, categories
- ✅ Product images organized in `/images/products/{category}/`
- ✅ Mobile-responsive design throughout
- ✅ Email templates configured (Resend integration)

### Phase 4: Feature Expansion ✅ MOSTLY COMPLETE
**Goal**: Add business-critical features with regression tests

| Feature | Status | Notes |
|---------|--------|-------|
| Discount/promo codes | ✅ Done | Full CRUD + validation API |
| Customer accounts | ✅ Done | Profile, addresses, preferences |
| Order history for customers | ✅ Done | View past orders in profile |
| Loyalty program | ⏳ Schema ready | Points system needs UI |
| Product inventory tracking | ⏳ Schema ready | Variants have inventory_count |
| Custom cake ordering | ⏳ Pending | Lead time logic exists |
| Multiple pickup locations | ⏳ Pending | Zone logic supports it |
| Subscription/recurring orders | ⏳ Pending | Future Stripe integration |

### Phase 5: Production Hardening (Current Focus)
**Goal**: Ready for real traffic

1. **Security Audit** ✅ COMPLETE (2025-12-10)
   - ✅ RLS policies enabled on all tables
   - ✅ API route authentication audit complete
   - ✅ Development-only endpoints protected
   - ⏳ Rate limiting on APIs (recommended for production)

2. **Monitoring & Logging**
   - ⏳ Error tracking (Sentry or similar)
   - ⏳ Webhook delivery monitoring
   - ⏳ Performance metrics

3. **Code Quality**
   - ✅ Reduce `as any` casts (27→6 instances, remaining are necessary Supabase workarounds)
   - ✅ Add order tracking E2E tests (14 pass, 3 skip)
   - ⏳ Add email delivery tests (needs Jest/Vitest)

---

## 🧪 Testing Strategy

### E2E Test Status (Last Updated: 2025-12-10)

**Result: 45 passed, 23 skipped on chromium** ✅

| Suite | File | Tests | Status |
|-------|------|-------|--------|
| Product browsing | `tests/e2e/products.spec.ts` | 9 pass, 1 skip | ✅ Working |
| Cart operations | `tests/e2e/cart.spec.ts` | 10 pass | ✅ Working |
| Checkout flow | `tests/e2e/checkout.spec.ts` | 9 pass | ✅ Working |
| Admin dashboard | `tests/e2e/admin.spec.ts` | 3 pass, 19 skip | ✅ Working (skips require admin setup) |
| Order tracking | `tests/e2e/order-tracking.spec.ts` | 14 pass, 3 skip | ✅ Working (skips require seeded orders) |
| Email delivery | - | - | ⏳ Needs unit test setup (Jest/Vitest) |

### E2E Test Fixes Applied (2025-12-08)

Key fixes made to resolve selector mismatches:

1. **Cookie banner blocking** - Added `dismissCookieBanner()` helper in `test-utils.ts`
2. **Missing data-testid** - Added `data-testid="cart-button"` and `data-testid="cart-count"` to `header.tsx`
3. **Next button collision** - Changed `/next/i` regex to `{ name: 'Next', exact: true }` to avoid matching Next.js Dev Tools
4. **CardTitle not heading role** - Changed `getByRole('heading')` to `getByText()` for CardTitle elements
5. **Invalid locator syntax** - Fixed `text=/\$/` in combined selectors to use proper `.or()` chains
6. **Navigation timing** - Changed from `Promise.all` pattern to sequential click + waitForURL
7. **Config optimizations** - Increased timeouts, reduced workers for stability

### Shared Test Utilities
Location: `tests/e2e/fixtures/test-utils.ts`
- `dismissCookieBanner(page)` - Handles cookie consent banner
- `waitForProductsToLoad(page)` - Waits for product cards from Suspense
- `navigateToFirstProduct(page)` - Navigates to first product detail
- `addFirstProductToCart(page)` - Adds first product to cart
- `openCartSheet(page)` - Opens the cart sheet

### Regression Testing Protocol
Before merging any feature:
1. Run `npm run build` - must pass
2. Run `npx tsc --noEmit` - zero errors
3. Run `npm run lint` - no new warnings
4. Run `npx playwright test --project=chromium` - all tests pass
5. Manual smoke test of checkout flow

---

## 📋 Current Sprint Focus

**Active Work**: Phase 5 - Production Hardening

Priority order for next steps:
1. ~~**Admin Setup Documentation**~~ ✅ Complete - Admin dashboard fully tested and documented
2. ~~**Reduce `as any` Casts**~~ ✅ Complete - Reduced from 27 to ~6 instances (remaining are necessary Supabase SSR workarounds)
3. ~~**Order Tracking Tests**~~ ✅ Complete - 14 tests pass, 3 skipped (need seeded orders)
4. ~~**Security Audit**~~ ✅ Complete - All critical issues fixed (see below)
5. **Email Delivery Tests** - Requires unit test setup (Jest/Vitest) for template rendering, Resend mock
6. **Monitoring Setup** - Configure error tracking (Sentry recommended)
7. **Rate Limiting** - Add rate limiting middleware for API routes (optional for MVP)

### Security Audit Results (2025-12-10) ✅

| Route | Issue | Status | Fix Applied |
|-------|-------|--------|-------------|
| `/api/debug-db` | Exposed DB info without auth | ✅ Fixed | Development-only check, no stack traces |
| `/api/seed-db` | Could seed data without auth | ✅ Fixed | Development-only check, no stack traces |
| `/api/admin/production` | No admin auth | ✅ Fixed | Added `isAdmin()` check |
| `/api/admin/orders/[id]/notes` | No admin auth | ✅ Fixed | Added `isAdmin()` check |
| `/api/admin/orders/[id]/status` | No admin auth | ✅ Fixed | Added `isAdmin()` check |
| `/api/admin/discounts` | Only checked user login | ✅ Fixed | Added `isAdmin()` check |
| `/api/admin/discounts/[id]` | Only checked user login | ✅ Fixed | Added `isAdmin()` check |
| `/api/webhooks/stripe` | N/A | ✅ Secure | Has signature verification |
| `/api/admin/upload` | N/A | ✅ Secure | Has full admin verification |
| `/api/admin/products/sync-stripe` | N/A | ✅ Secure | Has full admin verification |
| `/api/checkout` | N/A | ✅ Secure | Validates inputs, handles rollback |
| `/api/discounts/validate` | No rate limiting | ⏳ Low risk | Consider rate limiting for production |

### Database Status
- **Tables**: 16 tables with RLS enabled
- **Migrations Applied**: 10 migrations (001-010)
- **Seed Data**: Products, variants, delivery zones, time slots, discount codes

### Admin Dashboard Testing (2025-12-10) ✅

Full admin dashboard manually tested and verified:

| Feature | Status | Notes |
|---------|--------|-------|
| Admin Login | ✅ Pass | Test account: admin@happysourdough.com |
| Dashboard Overview | ✅ Pass | Shows pending orders, stats |
| Products Management | ✅ Pass | 13 products with images, variants |
| Orders Management | ✅ Pass | Filtering, pagination working |
| Order Status Update | ✅ Pass | After RLS policy fix (migration 009) |
| Order Status History | ✅ Pass | After RLS policy fix (migration 010) |
| Discounts Management | ✅ Pass | 10 discount codes, full CRUD |

### RLS Policy Fixes Applied
- **Migration 009**: `add_admin_order_update_policy` - Admin UPDATE/SELECT on orders
- **Migration 010**: `add_admin_order_status_history_policies` - Admin INSERT/SELECT on order_status_history

### Recent Commits (2025-12-10)
- Admin RLS policy fixes for order management
- TypeScript type safety improvements for Supabase client
- Customer account management system
- Admin dashboard with product and discount management
- Discount validation API and checkout flow improvements
- UI component enhancements
- Product images and branding assets
- E2E test improvements with better selectors
