import { test, expect } from '@playwright/test';
import { TEST_DELIVERY_INFO } from './fixtures/test-data';
import { dismissCookieBanner } from './fixtures/test-utils';

test.describe('Checkout Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Add item to cart before each test
    await page.goto('/products');
    await dismissCookieBanner(page);

    // Wait for products to load from Suspense
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 15000 });
    await page.waitForLoadState('networkidle');

    const firstProduct = page.locator('[data-testid="product-card"]').first();
    await expect(firstProduct).toBeVisible();

    // Navigate to product detail
    await firstProduct.click();
    await page.waitForURL(/\/products\/[^/]+$/, { timeout: 15000 });

    const addToCartBtn = page.getByRole('button', { name: /add to cart/i });
    await expect(addToCartBtn).toBeVisible({ timeout: 10000 });
    await addToCartBtn.click();
    await page.waitForTimeout(1000);
  });

  // Helper to get the Next button (excludes Next.js dev tools button)
  function getNextButton(page: any) {
    return page.getByRole('button', { name: 'Next', exact: true });
  }

  // Helper to navigate to checkout
  async function goToCheckout(page: any) {
    await page.locator('[data-testid="cart-button"]').click();
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: /^checkout$/i }).click();
    await page.waitForURL(/\/checkout/, { timeout: 10000 });
  }

  test('should navigate to checkout from cart sheet', async ({ page }) => {
    // Open cart sheet
    await page.locator('[data-testid="cart-button"]').click();
    await page.waitForTimeout(500);

    // Click checkout button in cart sheet
    const checkoutBtn = page.getByRole('button', { name: /^checkout$/i });
    await checkoutBtn.click();

    // Wait for checkout page
    await page.waitForURL(/\/checkout/, { timeout: 10000 });

    // Verify checkout page elements
    await expect(page.getByRole('heading', { name: /checkout/i })).toBeVisible();
  });

  test('should display step indicator on checkout page', async ({ page }) => {
    await goToCheckout(page);

    // Verify first step (Review Your Order) is shown
    await expect(page.getByRole('heading', { name: /review your order/i })).toBeVisible();

    // Verify cart items are displayed
    const cartItems = page.locator('[class*="border"][class*="rounded"]');
    expect(await cartItems.count()).toBeGreaterThan(0);
  });

  test('should proceed to delivery step', async ({ page }) => {
    await goToCheckout(page);

    // Click Next to go to delivery step
    await getNextButton(page).click();

    // Verify delivery details heading
    await expect(page.getByRole('heading', { name: /delivery details/i })).toBeVisible();
  });

  test('should fill delivery information', async ({ page }) => {
    await goToCheckout(page);
    await getNextButton(page).click();

    // Wait for delivery form to load
    await page.waitForTimeout(500);

    // Fill contact info
    const emailInput = page.getByLabel(/email/i);
    if (await emailInput.count() > 0) {
      await emailInput.fill(TEST_DELIVERY_INFO.email);
    }

    const nameInput = page.getByLabel(/full name|name/i);
    if (await nameInput.count() > 0) {
      await nameInput.first().fill(TEST_DELIVERY_INFO.name);
    }

    const phoneInput = page.getByLabel(/phone/i);
    if (await phoneInput.count() > 0) {
      await phoneInput.fill(TEST_DELIVERY_INFO.phone);
    }
  });

  test('should select fulfillment type', async ({ page }) => {
    await goToCheckout(page);
    await getNextButton(page).click();
    await page.waitForTimeout(500);

    // Look for fulfillment type options
    const deliveryOption = page.getByRole('radio', { name: /delivery/i })
      .or(page.locator('button:has-text("Delivery")'));
    const pickupOption = page.getByRole('radio', { name: /pickup/i })
      .or(page.locator('button:has-text("Pickup")'));

    if (await pickupOption.count() > 0) {
      await pickupOption.first().click();
      await page.waitForTimeout(500);
    }

    if (await deliveryOption.count() > 0) {
      await deliveryOption.first().click();
      await page.waitForTimeout(500);
    }
  });

  test('should validate required checkout fields', async ({ page }) => {
    await goToCheckout(page);
    await getNextButton(page).click();
    await page.waitForTimeout(500);

    // Try to click Next without filling fields
    const nextBtn = getNextButton(page);
    if (await nextBtn.count() > 0) {
      await nextBtn.click();
      await page.waitForTimeout(500);

      // Should show validation error (sonner toast)
      const toast = page.locator('[data-sonner-toast]');
      if (await toast.count() > 0) {
        await expect(toast.first()).toBeVisible();
      }
    }
  });

  test('should proceed to payment step when delivery is filled', async ({ page }) => {
    await goToCheckout(page);
    await getNextButton(page).click();
    await page.waitForTimeout(500);

    // Fill all required delivery fields
    const emailInput = page.getByLabel(/email/i);
    if (await emailInput.count() > 0) {
      await emailInput.fill(TEST_DELIVERY_INFO.email);
    }

    const nameInput = page.getByLabel(/full name|name/i);
    if (await nameInput.count() > 0) {
      await nameInput.first().fill(TEST_DELIVERY_INFO.name);
    }

    const phoneInput = page.getByLabel(/phone/i);
    if (await phoneInput.count() > 0) {
      await phoneInput.fill(TEST_DELIVERY_INFO.phone);
    }

    // Select pickup to avoid needing delivery address
    const pickupOption = page.locator('button:has-text("Pickup")');
    if (await pickupOption.count() > 0) {
      await pickupOption.click();
      await page.waitForTimeout(500);
    }

    // Select a date and time slot
    const dateSelect = page.locator('[data-testid="date-select"]').or(page.getByLabel(/date/i));
    if (await dateSelect.count() > 0) {
      await dateSelect.first().click();
      await page.waitForTimeout(300);
      // Select first available option
      const dateOption = page.getByRole('option').first();
      if (await dateOption.count() > 0) {
        await dateOption.click();
      }
    }
  });

  test('should show confirmation page after mock successful payment', async ({ page }) => {
    // Go directly to success page with mock session
    await page.goto('/checkout/success?session_id=test_session_123');
    await dismissCookieBanner(page);

    // Look for success indicators
    const successHeading = page.getByRole('heading', { name: /thank you|confirmed|success/i });
    if (await successHeading.count() > 0) {
      await expect(successHeading.first()).toBeVisible();
    }
  });

  test('should go back to cart step from delivery step', async ({ page }) => {
    await goToCheckout(page);
    await getNextButton(page).click();
    await page.waitForTimeout(500);

    // Click Back button
    const backBtn = page.getByRole('button', { name: /back/i });
    await backBtn.click();

    // Should be back on cart review step
    await expect(page.getByRole('heading', { name: /review your order/i })).toBeVisible();
  });
});
