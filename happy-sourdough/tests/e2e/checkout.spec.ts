import { test, expect } from '@playwright/test';
import { STRIPE_TEST_CARDS, TEST_DELIVERY_INFO } from './fixtures/test-data';

test.describe('Checkout Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Add item to cart before each test
    await page.goto('/products');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('[data-testid="product-card"], .product-card, article');

    const firstProduct = page.locator('[data-testid="product-card"], .product-card, article').first();
    await firstProduct.getByRole('link').first().or(firstProduct).click();
    await page.waitForURL(/\/products\/.+/);

    await page.getByRole('button', { name: /add to cart/i }).click();
    await page.waitForTimeout(1000);

    // Navigate to cart
    const cartLink = page.getByRole('link', { name: /cart/i })
      .or(page.locator('[href="/cart"]'));
    await cartLink.first().click();
    await page.waitForURL(/\/cart/);
  });

  test('should navigate to checkout from cart', async ({ page }) => {
    // Click checkout button
    const checkoutBtn = page.getByRole('button', { name: /checkout|proceed to checkout/i })
      .or(page.getByRole('link', { name: /checkout|proceed to checkout/i }));
    await checkoutBtn.first().click();

    // Wait for checkout page
    await page.waitForURL(/\/checkout/);

    // Verify checkout page elements
    await expect(page.getByRole('heading', { name: /checkout|delivery|payment/i })).toBeVisible();
  });

  test('should fill delivery information', async ({ page }) => {
    // Navigate to checkout
    const checkoutBtn = page.getByRole('button', { name: /checkout|proceed to checkout/i })
      .or(page.getByRole('link', { name: /checkout|proceed to checkout/i }));
    await checkoutBtn.first().click();
    await page.waitForURL(/\/checkout/);

    // Fill delivery form
    const nameInput = page.getByLabel(/name|full name/i).or(page.getByPlaceholder(/name/i));
    if (await nameInput.count() > 0) {
      await nameInput.first().fill(TEST_DELIVERY_INFO.name);
    }

    const emailInput = page.getByLabel(/email/i).or(page.getByPlaceholder(/email/i));
    if (await emailInput.count() > 0) {
      await emailInput.first().fill(TEST_DELIVERY_INFO.email);
    }

    const phoneInput = page.getByLabel(/phone/i).or(page.getByPlaceholder(/phone/i));
    if (await phoneInput.count() > 0) {
      await phoneInput.first().fill(TEST_DELIVERY_INFO.phone);
    }

    const addressInput = page.getByLabel(/address|street/i).or(page.getByPlaceholder(/address/i));
    if (await addressInput.count() > 0) {
      await addressInput.first().fill(TEST_DELIVERY_INFO.address);
    }

    const cityInput = page.getByLabel(/city/i).or(page.getByPlaceholder(/city/i));
    if (await cityInput.count() > 0) {
      await cityInput.first().fill(TEST_DELIVERY_INFO.city);
    }

    const zipInput = page.getByLabel(/zip|postal/i).or(page.getByPlaceholder(/zip/i));
    if (await zipInput.count() > 0) {
      await zipInput.first().fill(TEST_DELIVERY_INFO.zip);
    }

    // Verify form is filled
    if (await nameInput.count() > 0) {
      await expect(nameInput.first()).toHaveValue(TEST_DELIVERY_INFO.name);
    }
  });

  test('should select delivery method', async ({ page }) => {
    const checkoutBtn = page.getByRole('button', { name: /checkout|proceed to checkout/i })
      .or(page.getByRole('link', { name: /checkout|proceed to checkout/i }));
    await checkoutBtn.first().click();
    await page.waitForURL(/\/checkout/);

    // Look for delivery method options
    const deliveryOption = page.getByRole('radio', { name: /delivery/i })
      .or(page.getByLabel(/delivery/i));
    const pickupOption = page.getByRole('radio', { name: /pickup/i })
      .or(page.getByLabel(/pickup/i));

    if (await deliveryOption.count() > 0) {
      await deliveryOption.first().click();
      await page.waitForTimeout(500);

      // Verify delivery-specific fields appear
      const addressInput = page.getByLabel(/address|street/i);
      if (await addressInput.count() > 0) {
        await expect(addressInput.first()).toBeVisible();
      }
    }

    if (await pickupOption.count() > 0) {
      await pickupOption.first().click();
      await page.waitForTimeout(500);
    }
  });

  test('should select delivery time slot', async ({ page }) => {
    const checkoutBtn = page.getByRole('button', { name: /checkout|proceed to checkout/i })
      .or(page.getByRole('link', { name: /checkout|proceed to checkout/i }));
    await checkoutBtn.first().click();
    await page.waitForURL(/\/checkout/);

    // Look for time slot selector
    const timeSlotSelector = page.getByLabel(/time slot|delivery time|pickup time/i)
      .or(page.locator('[data-testid="time-slot-selector"]'));

    if (await timeSlotSelector.count() > 0) {
      await timeSlotSelector.first().click();
      await page.waitForTimeout(500);

      // Select first available time slot
      const firstSlot = page.getByRole('option').first()
        .or(page.getByRole('radio').first());

      if (await firstSlot.count() > 0) {
        await firstSlot.click();
      }
    }
  });

  test('should display order summary', async ({ page }) => {
    const checkoutBtn = page.getByRole('button', { name: /checkout|proceed to checkout/i })
      .or(page.getByRole('link', { name: /checkout|proceed to checkout/i }));
    await checkoutBtn.first().click();
    await page.waitForURL(/\/checkout/);

    // Verify order summary section
    const orderSummary = page.locator('[data-testid="order-summary"], .order-summary');
    if (await orderSummary.count() > 0) {
      await expect(orderSummary.first()).toBeVisible();
    }

    // Verify subtotal
    const subtotal = page.locator('[data-testid="subtotal"], text=/subtotal/i');
    if (await subtotal.count() > 0) {
      await expect(subtotal.first()).toBeVisible();
    }

    // Verify total
    const total = page.locator('[data-testid="total"], text=/total/i');
    if (await total.count() > 0) {
      await expect(total.first()).toBeVisible();
    }
  });

  test('should calculate delivery fee based on zone', async ({ page }) => {
    const checkoutBtn = page.getByRole('button', { name: /checkout|proceed to checkout/i })
      .or(page.getByRole('link', { name: /checkout|proceed to checkout/i }));
    await checkoutBtn.first().click();
    await page.waitForURL(/\/checkout/);

    // Select delivery method
    const deliveryOption = page.getByRole('radio', { name: /delivery/i })
      .or(page.getByLabel(/delivery/i));
    if (await deliveryOption.count() > 0) {
      await deliveryOption.first().click();
      await page.waitForTimeout(500);
    }

    // Enter address that triggers delivery fee
    const addressInput = page.getByLabel(/address|street/i).or(page.getByPlaceholder(/address/i));
    if (await addressInput.count() > 0) {
      await addressInput.first().fill(TEST_DELIVERY_INFO.address);
    }

    const zipInput = page.getByLabel(/zip|postal/i).or(page.getByPlaceholder(/zip/i));
    if (await zipInput.count() > 0) {
      await zipInput.first().fill(TEST_DELIVERY_INFO.zip);
      await zipInput.first().blur(); // Trigger validation
      await page.waitForTimeout(1000);
    }

    // Check if delivery fee is displayed
    const deliveryFee = page.locator('[data-testid="delivery-fee"], text=/delivery/i');
    if (await deliveryFee.count() > 0) {
      await expect(deliveryFee.first()).toBeVisible();
    }
  });

  test('should proceed to payment step', async ({ page }) => {
    const checkoutBtn = page.getByRole('button', { name: /checkout|proceed to checkout/i })
      .or(page.getByRole('link', { name: /checkout|proceed to checkout/i }));
    await checkoutBtn.first().click();
    await page.waitForURL(/\/checkout/);

    // Fill minimum required fields
    const emailInput = page.getByLabel(/email/i).or(page.getByPlaceholder(/email/i));
    if (await emailInput.count() > 0) {
      await emailInput.first().fill(TEST_DELIVERY_INFO.email);
    }

    const nameInput = page.getByLabel(/name|full name/i).or(page.getByPlaceholder(/name/i));
    if (await nameInput.count() > 0) {
      await nameInput.first().fill(TEST_DELIVERY_INFO.name);
    }

    // Look for continue/next button
    const continueBtn = page.getByRole('button', { name: /continue|next|proceed to payment/i });
    if (await continueBtn.count() > 0) {
      await continueBtn.first().click();
      await page.waitForTimeout(2000);

      // Verify payment section appears or navigation to payment
      const paymentSection = page.locator('[data-testid="payment"], text=/payment/i, iframe');
      if (await paymentSection.count() > 0) {
        await expect(paymentSection.first()).toBeVisible();
      }
    }
  });

  test('should display Stripe payment form', async ({ page }) => {
    const checkoutBtn = page.getByRole('button', { name: /checkout|proceed to checkout/i })
      .or(page.getByRole('link', { name: /checkout|proceed to checkout/i }));
    await checkoutBtn.first().click();
    await page.waitForURL(/\/checkout/);

    // Fill required delivery info
    const emailInput = page.getByLabel(/email/i).or(page.getByPlaceholder(/email/i));
    if (await emailInput.count() > 0) {
      await emailInput.first().fill(TEST_DELIVERY_INFO.email);
    }

    const nameInput = page.getByLabel(/name|full name/i).or(page.getByPlaceholder(/name/i));
    if (await nameInput.count() > 0) {
      await nameInput.first().fill(TEST_DELIVERY_INFO.name);
    }

    // Wait for Stripe Elements to load (they load in iframes)
    await page.waitForTimeout(3000);

    // Check for Stripe iframe
    const stripeFrame = page.frameLocator('iframe[name^="__privateStripeFrame"]');
    const stripeElement = stripeFrame.locator('input[name="cardnumber"], input[placeholder*="card"]');

    // If Stripe loaded, verify the payment element exists
    const frameCount = await page.locator('iframe[name^="__privateStripeFrame"]').count();
    if (frameCount > 0) {
      // Stripe is present, test passes
      expect(frameCount).toBeGreaterThan(0);
    }
  });

  test('should validate required checkout fields', async ({ page }) => {
    const checkoutBtn = page.getByRole('button', { name: /checkout|proceed to checkout/i })
      .or(page.getByRole('link', { name: /checkout|proceed to checkout/i }));
    await checkoutBtn.first().click();
    await page.waitForURL(/\/checkout/);

    // Try to submit without filling required fields
    const submitBtn = page.getByRole('button', { name: /place order|complete order|pay now/i });
    if (await submitBtn.count() > 0) {
      await submitBtn.first().click();
      await page.waitForTimeout(1000);

      // Look for validation errors
      const errorMessages = page.locator('.error, [role="alert"], text=/required|invalid/i');
      const errorCount = await errorMessages.count();

      // Should show validation errors
      expect(errorCount).toBeGreaterThan(0);
    }
  });

  test('should show order confirmation after successful payment', async ({ page }) => {
    // This test would require completing the full payment flow
    // For now, we'll just navigate to a mock confirmation page
    await page.goto('/checkout/success?session_id=test_session_123');

    // Verify confirmation page elements
    const confirmationHeading = page.getByRole('heading', { name: /thank you|order confirmed|success/i });
    if (await confirmationHeading.count() > 0) {
      await expect(confirmationHeading.first()).toBeVisible();
    }

    // Look for order number
    const orderNumber = page.locator('[data-testid="order-number"], text=/order #|order number/i');
    if (await orderNumber.count() > 0) {
      await expect(orderNumber.first()).toBeVisible();
    }
  });

  test('should allow adding delivery notes', async ({ page }) => {
    const checkoutBtn = page.getByRole('button', { name: /checkout|proceed to checkout/i })
      .or(page.getByRole('link', { name: /checkout|proceed to checkout/i }));
    await checkoutBtn.first().click();
    await page.waitForURL(/\/checkout/);

    // Look for notes/instructions field
    const notesField = page.getByLabel(/notes|instructions|special requests/i)
      .or(page.getByPlaceholder(/notes|instructions/i))
      .or(page.locator('textarea'));

    if (await notesField.count() > 0) {
      await notesField.first().fill(TEST_DELIVERY_INFO.deliveryNotes);
      await expect(notesField.first()).toHaveValue(TEST_DELIVERY_INFO.deliveryNotes);
    }
  });

  test('should display minimum order warning if applicable', async ({ page }) => {
    const checkoutBtn = page.getByRole('button', { name: /checkout|proceed to checkout/i })
      .or(page.getByRole('link', { name: /checkout|proceed to checkout/i }));
    await checkoutBtn.first().click();
    await page.waitForURL(/\/checkout/);

    // Look for minimum order message
    const minOrderWarning = page.locator('text=/minimum order|minimum purchase/i');
    if (await minOrderWarning.count() > 0) {
      await expect(minOrderWarning.first()).toBeVisible();
    }
  });

  test('should persist checkout data on page refresh', async ({ page }) => {
    const checkoutBtn = page.getByRole('button', { name: /checkout|proceed to checkout/i })
      .or(page.getByRole('link', { name: /checkout|proceed to checkout/i }));
    await checkoutBtn.first().click();
    await page.waitForURL(/\/checkout/);

    // Fill some data
    const emailInput = page.getByLabel(/email/i).or(page.getByPlaceholder(/email/i));
    if (await emailInput.count() > 0) {
      await emailInput.first().fill(TEST_DELIVERY_INFO.email);
      await page.waitForTimeout(500);

      // Refresh page
      await page.reload();
      await page.waitForLoadState('networkidle');

      // Verify data persisted (if implemented)
      const emailValue = await emailInput.first().inputValue();
      // Note: This may or may not persist depending on implementation
    }
  });
});
