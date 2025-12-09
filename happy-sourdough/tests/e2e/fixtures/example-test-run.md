# Example Test Run Output

This document shows what a successful test run looks like.

## Running Tests in UI Mode

```bash
npm run test:e2e:ui
```

Output:
```
> happy-sourdough@0.1.0 test:e2e:ui
> playwright test --ui

Serving HTML report at http://localhost:9323. Press Ctrl+C to quit.
```

## Running Tests in Headless Mode

```bash
npm run test:e2e
```

Expected Output:
```
> happy-sourdough@0.1.0 test:e2e
> playwright test

Running 52 tests using 4 workers

  ✓  1 products.spec.ts:6:5 › Product Browsing › should display homepage with featured products (chromium) (1.2s)
  ✓  2 products.spec.ts:12:5 › Product Browsing › should navigate to products page (chromium) (856ms)
  ✓  3 products.spec.ts:22:5 › Product Browsing › should display product catalog (chromium) (1.1s)
  ✓  4 products.spec.ts:34:5 › Product Browsing › should filter products by category (chromium) (2.3s)
  ✓  5 products.spec.ts:52:5 › Product Browsing › should view product detail page (chromium) (1.8s)
  ✓  6 products.spec.ts:72:5 › Product Browsing › should search for products (chromium) (1.4s)
  ✓  7 products.spec.ts:89:5 › Product Browsing › should display product images (chromium) (1.2s)
  ✓  8 products.spec.ts:106:5 › Product Browsing › should handle product variants/sizes (chromium) (1.9s)
  ✓  9 products.spec.ts:131:5 › Product Browsing › should display product prices correctly (chromium) (1.1s)
  ✓  10 products.spec.ts:144:5 › Product Browsing › should be responsive on mobile (chromium) (2.1s)

  ✓  11 cart.spec.ts:7:5 › Shopping Cart › should add item to cart from product detail page (chromium) (2.5s)
  ✓  12 cart.spec.ts:28:5 › Shopping Cart › should add item to cart from product listing (chromium) (1.8s)
  ✓  13 cart.spec.ts:50:5 › Shopping Cart › should view cart contents (chromium) (2.2s)
  ✓  14 cart.spec.ts:72:5 › Shopping Cart › should change item quantity in cart (chromium) (3.1s)
  ✓  15 cart.spec.ts:114:5 › Shopping Cart › should remove item from cart (chromium) (2.4s)
  ✓  16 cart.spec.ts:145:5 › Shopping Cart › should calculate cart subtotal correctly (chromium) (2.6s)
  ✓  17 cart.spec.ts:174:5 › Shopping Cart › should persist cart across page navigation (chromium) (2.8s)
  ✓  18 cart.spec.ts:197:5 › Shopping Cart › should show checkout button when cart has items (chromium) (2.1s)
  ✓  19 cart.spec.ts:215:5 › Shopping Cart › should update cart total when quantity changes (chromium) (3.3s)
  ✓  20 cart.spec.ts:249:5 › Shopping Cart › should display empty cart message when no items (chromium) (1.7s)

  ✓  21 checkout.spec.ts:7:5 › Checkout Flow › should navigate to checkout from cart (chromium) (2.9s)
  ✓  22 checkout.spec.ts:23:5 › Checkout Flow › should fill delivery information (chromium) (3.4s)
  ✓  23 checkout.spec.ts:72:5 › Checkout Flow › should select delivery method (chromium) (2.7s)
  ✓  24 checkout.spec.ts:98:5 › Checkout Flow › should select delivery time slot (chromium) (2.3s)
  ✓  25 checkout.spec.ts:118:5 › Checkout Flow › should display order summary (chromium) (2.1s)
  ✓  26 checkout.spec.ts:140:5 › Checkout Flow › should calculate delivery fee based on zone (chromium) (3.2s)
  ✓  27 checkout.spec.ts:170:5 › Checkout Flow › should proceed to payment step (chromium) (3.6s)
  ✓  28 checkout.spec.ts:199:5 › Checkout Flow › should display Stripe payment form (chromium) (4.2s)
  ✓  29 checkout.spec.ts:230:5 › Checkout Flow › should validate required checkout fields (chromium) (2.5s)
  ✓  30 checkout.spec.ts:246:5 › Checkout Flow › should show order confirmation after successful payment (chromium) (1.8s)

  ✓  31 admin.spec.ts:6:5 › Admin Panel › Admin Login › should display admin login page (chromium) (1.1s)
  ✓  32 admin.spec.ts:13:5 › Admin Panel › Admin Login › should show error for invalid credentials (chromium) (2.4s)
  ✓  33 admin.spec.ts:26:5 › Admin Panel › Admin Login › should redirect to dashboard after successful login (chromium) (3.1s)
  ✓  34 admin.spec.ts:37:5 › Admin Panel › Admin Login › should validate required fields (chromium) (1.2s)
  ✓  35 admin.spec.ts:54:5 › Admin Panel › Admin Dashboard › should display dashboard statistics (chromium) (2.3s)
  ✓  36 admin.spec.ts:70:5 › Admin Panel › Admin Dashboard › should display recent orders (chromium) (1.9s)
  ✓  37 admin.spec.ts:84:5 › Admin Panel › Admin Dashboard › should navigate to orders page from sidebar (chromium) (2.1s)
  ✓  38 admin.spec.ts:93:5 › Admin Panel › Admin Dashboard › should navigate to production page from sidebar (chromium) (1.8s)
  ✓  39 admin.spec.ts:102:5 › Admin Panel › Admin Dashboard › should navigate to zones page from sidebar (chromium) (1.7s)
  ✓  40 admin.spec.ts:111:5 › Admin Panel › Admin Dashboard › should display user menu in header (chromium) (1.6s)
  ✓  41 admin.spec.ts:123:5 › Admin Panel › Admin Dashboard › should logout successfully (chromium) (2.2s)
  ✓  42 admin.spec.ts:148:5 › Admin Panel › Admin Orders Management › should display orders list (chromium) (2.1s)
  ✓  43 admin.spec.ts:158:5 › Admin Panel › Admin Orders Management › should filter orders by status (chromium) (2.8s)
  ✓  44 admin.spec.ts:176:5 › Admin Panel › Admin Orders Management › should view order details (chromium) (2.4s)
  ✓  45 admin.spec.ts:197:5 › Admin Panel › Admin Orders Management › should update order status (chromium) (3.5s)
  ✓  46 admin.spec.ts:236:5 › Admin Panel › Admin Orders Management › should search orders (chromium) (2.3s)
  ✓  47 admin.spec.ts:253:5 › Admin Panel › Admin Orders Management › should paginate through orders (chromium) (2.6s)
  ✓  48 admin.spec.ts:271:5 › Admin Panel › Admin Orders Management › should display order totals and customer info (chromium) (1.8s)

  52 passed (3.5m)

To open last HTML report run:

  npx playwright show-report
```

## Test Coverage Summary

### Products (10 tests)
- ✓ Homepage display
- ✓ Navigation
- ✓ Catalog display
- ✓ Category filtering
- ✓ Product details
- ✓ Search functionality
- ✓ Image display
- ✓ Variant handling
- ✓ Price display
- ✓ Mobile responsive

### Cart (10 tests)
- ✓ Add from detail page
- ✓ Add from listing
- ✓ View cart
- ✓ Change quantity
- ✓ Remove items
- ✓ Subtotal calculation
- ✓ Cart persistence
- ✓ Checkout button
- ✓ Total updates
- ✓ Empty state

### Checkout (13 tests)
- ✓ Navigate to checkout
- ✓ Fill delivery info
- ✓ Select delivery method
- ✓ Select time slot
- ✓ Order summary
- ✓ Delivery fee calculation
- ✓ Payment step
- ✓ Stripe form
- ✓ Field validation
- ✓ Order confirmation
- ✓ Delivery notes
- ✓ Minimum order warning
- ✓ Data persistence

### Admin (19 tests)
- ✓ Login page display
- ✓ Invalid credentials
- ✓ Successful login
- ✓ Field validation
- ✓ Dashboard stats
- ✓ Recent orders
- ✓ Navigation (multiple pages)
- ✓ User menu
- ✓ Logout
- ✓ Orders list
- ✓ Status filtering
- ✓ Order details
- ✓ Status updates
- ✓ Search
- ✓ Pagination
- ✓ Order info display
- ✓ Auth guards
- ✓ Session persistence
- ✓ Mobile responsive

## Test Report

After running tests, open the HTML report:

```bash
npm run test:e2e:report
```

The report shows:
- Pass/fail status for each test
- Execution time
- Screenshots of failures
- Video recordings (on retry)
- Detailed traces
- Browser console logs
- Network activity

## Debugging Failed Tests

If a test fails, you'll see:

```
  ✗  1 checkout.spec.ts:199:5 › Checkout Flow › should display Stripe payment form (chromium) (4.2s)

    Error: Timeout 30000ms exceeded.
    Locator: page.frameLocator('iframe[name^="__privateStripeFrame"]').locator('input[name="cardnumber"]')

    Call log:
      - waiting for frameLocator('iframe[name^="__privateStripeFrame"]').locator('input[name="cardnumber"]')

    at tests/e2e/checkout.spec.ts:215
```

View the failure:
1. Screenshot saved in `test-results/`
2. Video saved in `test-results/` (if retry occurred)
3. Trace file available in report

## Running Specific Tests

```bash
# Run only products tests
npx playwright test products.spec.ts

# Run only admin tests
npx playwright test admin.spec.ts

# Run single test by name
npx playwright test -g "should add item to cart"

# Run tests in debug mode
npx playwright test --debug checkout.spec.ts
```

## Performance Metrics

Typical execution times:
- Products tests: ~20s
- Cart tests: ~25s
- Checkout tests: ~35s
- Admin tests: ~45s

Total: ~2-3 minutes for full suite (4 workers parallel)

## CI/CD Results

When running in GitHub Actions:
```
Run npm run test:e2e
  52 passed (4.2m)

✓ Upload test results
  Uploaded playwright-report (2.3 MB)
```

Artifacts available:
- playwright-report.zip (HTML report)
- test-videos.zip (failure videos, if any)
