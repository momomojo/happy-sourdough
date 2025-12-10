# E2E Testing Guide - Happy Sourdough

This directory contains end-to-end (E2E) tests for the Happy Sourdough bakery e-commerce platform using Playwright.

## Test Coverage

### 1. Product Browsing (`e2e/products.spec.ts`)
- Display homepage with featured products
- Navigate to products page
- Display product catalog
- Filter products by category
- View product detail page
- Search for products
- Display product images
- Handle product variants/sizes
- Display product prices correctly
- Responsive design on mobile

### 2. Shopping Cart (`e2e/cart.spec.ts`)
- Add item to cart from product detail page
- Add item to cart from product listing
- View cart contents
- Change item quantity in cart
- Remove item from cart
- Calculate cart subtotal correctly
- Persist cart across page navigation
- Show checkout button when cart has items
- Update cart total when quantity changes
- Display empty cart message when no items

### 3. Checkout Flow (`e2e/checkout.spec.ts`)
- Navigate to checkout from cart
- Fill delivery information
- Select delivery method (delivery vs pickup)
- Select delivery time slot
- Display order summary
- Calculate delivery fee based on zone
- Proceed to payment step
- Display Stripe payment form
- Validate required checkout fields
- Show order confirmation after successful payment
- Allow adding delivery notes
- Display minimum order warning if applicable
- Persist checkout data on page refresh

### 4. Admin Panel (`e2e/admin.spec.ts`)

#### Admin Login
- Display admin login page
- Show error for invalid credentials
- Redirect to dashboard after successful login
- Validate required fields

#### Admin Dashboard
- Display dashboard statistics
- Display recent orders
- Navigate to orders page from sidebar
- Navigate to production page from sidebar
- Navigate to zones page from sidebar
- Display user menu in header
- Logout successfully

#### Admin Orders Management
- Display orders list
- Filter orders by status
- View order details
- Update order status
- Search orders
- Paginate through orders
- Display order totals and customer info

#### Admin Authentication Guard
- Redirect to login when accessing admin routes without auth
- Maintain session across page refreshes

#### Admin Mobile Responsiveness
- Display mobile menu on small screens

## Setup

Playwright is already installed. To run tests:

```bash
# Run all tests
npm run test:e2e

# Run tests with UI mode (recommended for development)
npm run test:e2e:ui

# Run tests in headed mode (see browser)
npm run test:e2e:headed

# Debug tests
npm run test:e2e:debug

# Run specific browser
npm run test:e2e:chromium
npm run test:e2e:firefox

# View test report
npm run test:e2e:report
```

## Test Configuration

Configuration is in `playwright.config.ts`:
- **Base URL**: `http://localhost:3000`
- **Browsers**: Chromium, Firefox, Mobile Chrome, Mobile Safari
- **Timeout**: 30 seconds per test
- **Retries**: 2 on CI, 0 locally
- **Screenshots**: On failure
- **Video**: On retry
- **Trace**: On first retry

## Test Data

Test data and helpers are in `e2e/fixtures/test-data.ts`:

### Test Users
```typescript
TEST_USERS.admin.email: 'admin@happysourdough.com'
TEST_USERS.admin.password: 'admin123'
```

### Stripe Test Cards
```typescript
STRIPE_TEST_CARDS.success.number: '4242424242424242'
STRIPE_TEST_CARDS.requiresAuth.number: '4000002500003155'
STRIPE_TEST_CARDS.declined.number: '4000000000000002'
```

### Test Delivery Info
```typescript
TEST_DELIVERY_INFO.name: 'John Doe'
TEST_DELIVERY_INFO.email: 'john@example.com'
TEST_DELIVERY_INFO.address: '123 Main St'
// ... and more
```

## Prerequisites

Before running tests, ensure:

1. **Database is seeded** with sample products
2. **Supabase is running** and accessible
3. **Stripe is configured** in test mode
4. **Admin user exists** with credentials from test data
5. **Development server** will start automatically (or use existing server)

### Creating Admin User

Run this SQL in Supabase SQL Editor:

```sql
UPDATE auth.users
SET raw_app_meta_data = jsonb_set(
  COALESCE(raw_app_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE email = 'admin@happysourdough.com';
```

## Test Structure

Each test file follows this pattern:

```typescript
import { test, expect } from '@playwright/test';
import { TEST_DATA } from './fixtures/test-data';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup before each test
    await page.goto('/');
  });

  test('should do something', async ({ page }) => {
    // Test implementation
    await expect(page.locator('...')).toBeVisible();
  });
});
```

## Best Practices

1. **Use data-testid attributes** for reliable selectors:
   ```html
   <div data-testid="product-card">...</div>
   ```

2. **Wait for network idle** on page loads:
   ```typescript
   await page.waitForLoadState('networkidle');
   ```

3. **Use semantic selectors** when possible:
   ```typescript
   page.getByRole('button', { name: /add to cart/i })
   ```

4. **Handle conditional elements** gracefully:
   ```typescript
   if (await element.count() > 0) {
     await element.click();
   }
   ```

5. **Use timeouts** for dynamic content:
   ```typescript
   await page.waitForTimeout(1000);
   ```

## Debugging Tests

### UI Mode (Recommended)
```bash
npm run test:e2e:ui
```
- Time travel through test execution
- See screenshots and videos
- Inspect DOM and network

### Debug Mode
```bash
npm run test:e2e:debug
```
- Step through tests line by line
- Set breakpoints
- Inspect page state

### Headed Mode
```bash
npm run test:e2e:headed
```
- See browser window during test execution
- Good for understanding test flow

## CI/CD Integration

Tests are configured to run in CI with:
- Automatic retries (2 attempts)
- Parallel execution
- Artifact collection (screenshots, videos, traces)
- HTML report generation

Add this to your CI workflow:

```yaml
- name: Install dependencies
  run: npm ci

- name: Install Playwright Browsers
  run: npx playwright install --with-deps

- name: Run E2E tests
  run: npm run test:e2e

- name: Upload test report
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```

## Common Issues

### Port Already in Use
If port 3000 is occupied:
```bash
lsof -ti:3000 | xargs kill -9
```

### Tests Timing Out
Increase timeout in `playwright.config.ts`:
```typescript
timeout: 60 * 1000, // 60 seconds
```

### Flaky Tests
- Add explicit waits: `await page.waitForTimeout(1000)`
- Wait for network: `await page.waitForLoadState('networkidle')`
- Use retry-ability: `await expect(locator).toBeVisible({ timeout: 10000 })`

### Stripe Not Loading
- Verify `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` in `.env.local`
- Check network tab for blocked requests
- Ensure test mode is enabled

## Writing New Tests

1. Create new spec file in `tests/e2e/`:
   ```typescript
   // tests/e2e/feature.spec.ts
   import { test, expect } from '@playwright/test';

   test.describe('Feature', () => {
     test('should work', async ({ page }) => {
       await page.goto('/feature');
       await expect(page).toHaveURL('/feature');
     });
   });
   ```

2. Add test data to `fixtures/test-data.ts` if needed

3. Run test:
   ```bash
   npm run test:e2e -- feature.spec.ts
   ```

## Test Maintenance

- Update selectors when UI changes
- Keep test data in sync with database schema
- Review and update tests when features change
- Remove obsolete tests
- Keep test fixtures DRY

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Debugging Guide](https://playwright.dev/docs/debug)
- [API Reference](https://playwright.dev/docs/api/class-playwright)

## Test Metrics

Track these metrics:
- Test coverage percentage
- Test execution time
- Flaky test rate
- Pass/fail ratio
- Time to fix failing tests

## Next Steps

1. Add visual regression tests with Playwright screenshots
2. Add API tests for backend endpoints
3. Add performance tests with Lighthouse
4. Set up test data factories for dynamic test data
5. Add accessibility tests with axe-core
6. Implement parallel test execution strategies
7. Add cross-browser compatibility matrix
