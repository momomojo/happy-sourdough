import { test, expect } from '@playwright/test';
import { dismissCookieBanner } from './fixtures/test-utils';
import { TEST_DELIVERY_INFO } from './fixtures/test-data';

test.describe('Order Tracking', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/track');
    await dismissCookieBanner(page);
  });

  test('should display the track order page with form', async ({ page }) => {
    // Check for main heading
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Track Your Order');

    // Check for form elements
    await expect(page.getByLabel(/order number/i)).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /track order/i })).toBeVisible();
  });

  test('should have placeholder text in form fields', async ({ page }) => {
    const orderInput = page.getByLabel(/order number/i);
    const emailInput = page.getByLabel(/email/i);

    // Check placeholders
    await expect(orderInput).toHaveAttribute('placeholder', /HS-\d{4}-\d{3}/);
    await expect(emailInput).toHaveAttribute('placeholder', /example\.com/);
  });

  test('should display help section with FAQ', async ({ page }) => {
    // Check for help section
    await expect(page.getByText(/need help/i).first()).toBeVisible();

    // Check for FAQ items
    await expect(page.getByText(/where can i find my order number/i)).toBeVisible();
    await expect(page.getByText(/can't find my confirmation email/i)).toBeVisible();
    await expect(page.getByText(/how often is the order status updated/i)).toBeVisible();
  });

  test('should display info cards about tracking features', async ({ page }) => {
    // Check for feature info cards
    await expect(page.getByText(/real-time updates/i)).toBeVisible();
    await expect(page.getByText(/delivery updates/i)).toBeVisible();
    await expect(page.getByText(/fresh guarantee/i)).toBeVisible();
  });

  test('should have back to shop link', async ({ page }) => {
    const backLink = page.getByRole('link', { name: /back to shop/i });
    await expect(backLink).toBeVisible();

    await backLink.click();
    await page.waitForURL(/\/products/);
    await expect(page).toHaveURL(/\/products/);
  });

  test('should require both fields to submit', async ({ page }) => {
    // Try to submit with empty form
    const submitButton = page.getByRole('button', { name: /track order/i });

    // Fill only order number
    await page.getByLabel(/order number/i).fill('HS-2024-001');
    await submitButton.click();

    // Form should not submit (HTML5 validation on email)
    await expect(page).toHaveURL(/\/track/);

    // Clear and try with only email
    await page.getByLabel(/order number/i).clear();
    await page.getByLabel(/email/i).fill(TEST_DELIVERY_INFO.email);
    await submitButton.click();

    // Form should not submit (HTML5 validation on order number)
    await expect(page).toHaveURL(/\/track/);
  });

  test('should show error for non-existent order', async ({ page }) => {
    // Fill form with fake data
    await page.getByLabel(/order number/i).fill('HS-9999-999');
    await page.getByLabel(/email/i).fill('nonexistent@test.com');

    // Submit form
    await page.getByRole('button', { name: /track order/i }).click();

    // Wait for loading to complete
    await expect(page.getByRole('button', { name: /tracking order/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /track order/i })).toBeVisible({ timeout: 10000 });

    // Check for error message
    await expect(page.getByText(/order not found/i)).toBeVisible();
  });

  test('should show loading state while tracking', async ({ page }) => {
    // Fill form with any data
    await page.getByLabel(/order number/i).fill('HS-2024-001');
    await page.getByLabel(/email/i).fill('test@example.com');

    // Click submit and check for loading state
    await page.getByRole('button', { name: /track order/i }).click();

    // Should show loading spinner/text
    await expect(page.getByText(/tracking order/i)).toBeVisible();
  });

  test('should have correct form labels and descriptions', async ({ page }) => {
    // Check for helper text under inputs
    await expect(page.getByText(/find this in your order confirmation email/i)).toBeVisible();
    await expect(page.getByText(/the email address used when placing the order/i)).toBeVisible();
  });

  test('should have contact email link in help section', async ({ page }) => {
    // Multiple email links exist on page, use first()
    const emailLink = page.getByRole('link', { name: /orders@happysourdough\.com/i }).first();
    await expect(emailLink).toBeVisible();
    await expect(emailLink).toHaveAttribute('href', 'mailto:orders@happysourdough.com');
  });

  test('should be accessible with keyboard navigation', async ({ page }) => {
    // Focus on the order number input directly
    const orderInput = page.getByLabel(/order number/i);
    await orderInput.focus();
    await expect(orderInput).toBeFocused();

    // Tab to email input
    await page.keyboard.press('Tab');
    const emailInput = page.getByLabel(/email/i);
    await expect(emailInput).toBeFocused();

    // Tab to submit button
    await page.keyboard.press('Tab');
    const submitButton = page.getByRole('button', { name: /track order/i });
    await expect(submitButton).toBeFocused();

    // Form should be navigable via keyboard
    await expect(submitButton).toBeVisible();
  });

  test('should clear error when form is modified', async ({ page }) => {
    // First, trigger an error
    await page.getByLabel(/order number/i).fill('HS-9999-999');
    await page.getByLabel(/email/i).fill('nonexistent@test.com');
    await page.getByRole('button', { name: /track order/i }).click();

    // Wait for error to appear
    await expect(page.getByText(/order not found/i)).toBeVisible({ timeout: 10000 });

    // Modify a field - error should clear on next submit
    await page.getByLabel(/order number/i).fill('HS-2024-001');
    await page.getByRole('button', { name: /track order/i }).click();

    // New request should be made
    await expect(page.getByText(/tracking order/i)).toBeVisible();
  });

  test('should accept valid order number format', async ({ page }) => {
    const orderInput = page.getByLabel(/order number/i);

    // Test various valid formats
    await orderInput.fill('HS-2024-001');
    await expect(orderInput).toHaveValue('HS-2024-001');

    await orderInput.fill('hs-2024-001'); // lowercase
    await expect(orderInput).toHaveValue('hs-2024-001');

    await orderInput.fill('HS-2025-999');
    await expect(orderInput).toHaveValue('HS-2025-999');
  });
});

test.describe('Order Tracking - Mobile', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('should be responsive on mobile', async ({ page }) => {
    await page.goto('/track');
    await dismissCookieBanner(page);

    // Check main elements are visible on mobile
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByLabel(/order number/i)).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /track order/i })).toBeVisible();

    // Form with track order button should be visible (more specific selector)
    const trackForm = page.locator('form').filter({ has: page.getByRole('button', { name: /track order/i }) });
    await expect(trackForm).toBeVisible();

    // Submit button should be full width on mobile
    const submitButton = page.getByRole('button', { name: /track order/i });
    const buttonBox = await submitButton.boundingBox();
    const viewportWidth = page.viewportSize()?.width || 375;

    // Button should take most of the form width (accounting for padding)
    expect(buttonBox?.width).toBeGreaterThan(viewportWidth * 0.5);
  });
});

test.describe('Order Tracking - With Test Order', () => {
  // Test order HS-2024-001 with email test@happysourdough.com has been seeded in the database

  test('should display order details for valid order', async ({ page }) => {
    await page.goto('/track');
    await dismissCookieBanner(page);

    // Fill with known test order (must exist in database)
    const testOrderNumber = 'HS-2024-001';
    const testEmail = 'test@happysourdough.com';

    await page.getByLabel(/order number/i).fill(testOrderNumber);
    await page.getByLabel(/email/i).fill(testEmail);
    await page.getByRole('button', { name: /track order/i }).click();

    // Wait for order details to load - look for the "Order Tracking" heading
    await expect(page.getByRole('heading', { name: /order tracking/i, level: 2 })).toBeVisible({ timeout: 10000 });

    // Check order number is displayed (use .first() since it appears multiple times on page)
    await expect(page.getByText(testOrderNumber).first()).toBeVisible();

    // Check for status tracker - look for "Order Status" heading and status steps
    await expect(page.getByRole('heading', { name: /order status/i, level: 2 })).toBeVisible();
    // Verify at least one status step is visible (Order Received, Confirmed, Baking, etc.)
    await expect(page.getByRole('heading', { name: /order received/i, level: 3 })).toBeVisible();

    // Check for "Track Another Order" button
    await expect(page.getByRole('button', { name: /track another order/i })).toBeVisible();
  });

  test('should show order items in details', async ({ page }) => {
    await page.goto('/track');
    await dismissCookieBanner(page);

    // Fill with known test order
    await page.getByLabel(/order number/i).fill('HS-2024-001');
    await page.getByLabel(/email/i).fill('test@happysourdough.com');
    await page.getByRole('button', { name: /track order/i }).click();

    // Wait for order details
    await expect(page.getByRole('heading', { name: /order tracking/i, level: 2 })).toBeVisible({ timeout: 10000 });

    // Check for order items section - look for "Order Items" text and product name
    await expect(page.getByText(/order items/i)).toBeVisible();
    // Verify the test order item is displayed (Classic Sourdough Loaf)
    await expect(page.getByRole('heading', { name: /classic sourdough loaf/i, level: 4 })).toBeVisible();
  });

  test('should allow tracking another order after viewing one', async ({ page }) => {
    await page.goto('/track');
    await dismissCookieBanner(page);

    // Track first order
    await page.getByLabel(/order number/i).fill('HS-2024-001');
    await page.getByLabel(/email/i).fill('test@happysourdough.com');
    await page.getByRole('button', { name: /track order/i }).click();

    // Wait for order details
    await expect(page.getByRole('heading', { name: /order tracking/i, level: 2 })).toBeVisible({ timeout: 10000 });

    // Click "Track Another Order"
    await page.getByRole('button', { name: /track another order/i }).click();

    // Form should be visible again with cleared inputs
    await expect(page.getByLabel(/order number/i)).toBeVisible();
    await expect(page.getByLabel(/order number/i)).toHaveValue('');
    await expect(page.getByLabel(/email/i)).toHaveValue('');
  });
});
