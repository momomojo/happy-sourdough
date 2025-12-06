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
