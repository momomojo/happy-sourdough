import { Page } from '@playwright/test';

/**
 * Dismisses the cookie consent banner if present
 */
export async function dismissCookieBanner(page: Page): Promise<void> {
  // Try multiple selectors for the cookie accept button
  const acceptButton = page.locator('button:has-text("Accept All")').first();

  try {
    await acceptButton.waitFor({ state: 'visible', timeout: 3000 });
    await acceptButton.click();
    await page.waitForTimeout(500);
  } catch {
    // Banner not present or already dismissed, continue
  }
}

/**
 * Waits for product cards to load from Suspense
 */
export async function waitForProductsToLoad(page: Page): Promise<void> {
  await page.waitForSelector('[data-testid="product-card"]', { timeout: 15000 });
  await page.waitForLoadState('networkidle');
}

/**
 * Navigates to a product detail page from the products list
 */
export async function navigateToFirstProduct(page: Page): Promise<void> {
  const firstProduct = page.locator('[data-testid="product-card"]').first();
  await Promise.all([
    page.waitForURL(/\/products\/.+/, { timeout: 15000 }),
    firstProduct.click()
  ]);
}

/**
 * Adds the first product to cart
 */
export async function addFirstProductToCart(page: Page): Promise<void> {
  await navigateToFirstProduct(page);

  const addToCartBtn = page.getByRole('button', { name: /add to cart/i });
  await addToCartBtn.waitFor({ state: 'visible', timeout: 10000 });
  await addToCartBtn.click();
  await page.waitForTimeout(1000);
}

/**
 * Opens the cart sheet
 */
export async function openCartSheet(page: Page): Promise<void> {
  await page.locator('[data-testid="cart-button"]').click();
  await page.waitForTimeout(500);
}
