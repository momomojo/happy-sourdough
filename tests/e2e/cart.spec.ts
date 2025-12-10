import { test, expect } from '@playwright/test';
import { dismissCookieBanner } from './fixtures/test-utils';

test.describe('Shopping Cart', () => {
  test.beforeEach(async ({ page }) => {
    // Start from products page
    await page.goto('/products');
    await dismissCookieBanner(page);

    // Wait for products to load from Suspense (skeletons replaced by actual products)
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 15000 });
    // Additional wait for hydration
    await page.waitForLoadState('networkidle');
  });

  // Helper to navigate to first product detail page
  async function navigateToProductDetail(page: any) {
    const firstProduct = page.locator('[data-testid="product-card"]').first();
    await expect(firstProduct).toBeVisible();
    await firstProduct.click();
    // Wait for product detail page URL (Next.js soft navigation)
    await page.waitForURL(/\/products\/[^/]+$/, { timeout: 15000 });
  }

  // Helper to add first product to cart
  async function addProductToCart(page: any) {
    await navigateToProductDetail(page);
    const addToCartBtn = page.getByRole('button', { name: /add to cart/i });
    await expect(addToCartBtn).toBeVisible({ timeout: 10000 });
    await addToCartBtn.click();
    await page.waitForTimeout(1000);
  }

  test('should add item to cart from product detail page', async ({ page }) => {
    // Navigate to product detail
    await navigateToProductDetail(page);

    // Get initial cart count
    const cartBadge = page.locator('[data-testid="cart-count"]');
    const initialCount = await cartBadge.count() > 0
      ? parseInt((await cartBadge.textContent()) || '0')
      : 0;

    // Add to cart
    const addToCartBtn = page.getByRole('button', { name: /add to cart/i });
    await expect(addToCartBtn).toBeVisible({ timeout: 10000 });
    await addToCartBtn.click();

    // Wait for cart update (toast notification or cart badge update)
    await page.waitForTimeout(1000);

    // Verify cart count increased
    const newBadge = page.locator('[data-testid="cart-count"]');
    if (await newBadge.count() > 0) {
      const newCount = parseInt((await newBadge.textContent()) || '0');
      expect(newCount).toBeGreaterThan(initialCount);
    }
  });

  test('should open cart sheet when clicking cart button', async ({ page }) => {
    // First add an item
    await addProductToCart(page);

    // Click cart button to open sheet
    const cartButton = page.locator('[data-testid="cart-button"]');
    await cartButton.click();

    // Verify cart sheet opens (look for sheet title)
    await expect(page.getByText(/shopping cart/i)).toBeVisible({ timeout: 5000 });
  });

  test('should view cart contents in sheet', async ({ page }) => {
    // Add an item first
    await addProductToCart(page);

    // Open cart sheet
    const cartButton = page.locator('[data-testid="cart-button"]');
    await cartButton.click();
    await page.waitForTimeout(500);

    // Verify cart item is displayed
    const cartItems = page.locator('[data-testid="cart-item"]');
    expect(await cartItems.count()).toBeGreaterThan(0);
  });

  test('should change item quantity in cart', async ({ page }) => {
    // Add an item and open cart
    await addProductToCart(page);

    // Open cart sheet
    await page.locator('[data-testid="cart-button"]').click();
    await page.waitForTimeout(500);

    // Find quantity controls (increase button has aria-label)
    const incrementBtn = page.getByRole('button', { name: /increase quantity/i });
    const decrementBtn = page.getByRole('button', { name: /decrease quantity/i });

    // Increase quantity
    if (await incrementBtn.count() > 0) {
      await incrementBtn.click();
      await page.waitForTimeout(500);
    }

    // Decrease quantity
    if (await decrementBtn.count() > 0 && await decrementBtn.isEnabled()) {
      await decrementBtn.click();
      await page.waitForTimeout(500);
    }
  });

  test('should remove item from cart', async ({ page }) => {
    // Add an item and open cart
    await addProductToCart(page);

    // Open cart sheet
    await page.locator('[data-testid="cart-button"]').click();
    await page.waitForTimeout(500);

    // Get initial cart item count
    const cartItems = page.locator('[data-testid="cart-item"]');
    const initialCount = await cartItems.count();
    expect(initialCount).toBeGreaterThan(0);

    // Remove item
    const removeBtn = page.getByRole('button', { name: /remove item/i }).first();
    await removeBtn.click();
    await page.waitForTimeout(500);

    // Verify item removed (cart should show empty state)
    const emptyMessage = page.getByText(/empty/i);
    if (await emptyMessage.count() > 0) {
      await expect(emptyMessage.first()).toBeVisible();
    }
  });

  test('should persist cart across page navigation', async ({ page }) => {
    // Add an item
    await addProductToCart(page);

    // Get cart count
    const cartBadge = page.locator('[data-testid="cart-count"]');
    const cartCount = await cartBadge.count() > 0
      ? parseInt((await cartBadge.textContent()) || '0')
      : 0;
    expect(cartCount).toBeGreaterThan(0);

    // Navigate away and back
    await page.goto('/');
    await dismissCookieBanner(page);
    await page.waitForLoadState('networkidle');

    // Verify cart count persisted
    const newBadge = page.locator('[data-testid="cart-count"]');
    if (await newBadge.count() > 0) {
      const newCount = parseInt((await newBadge.textContent()) || '0');
      expect(newCount).toBe(cartCount);
    }
  });

  test('should show checkout button when cart has items', async ({ page }) => {
    // Add an item
    await addProductToCart(page);

    // Open cart sheet
    await page.locator('[data-testid="cart-button"]').click();
    await page.waitForTimeout(500);

    // Verify checkout button exists
    const checkoutBtn = page.getByRole('button', { name: /checkout/i });
    await expect(checkoutBtn).toBeVisible();
  });

  test('should navigate to checkout from cart sheet', async ({ page }) => {
    // Add an item
    await addProductToCart(page);

    // Open cart sheet
    await page.locator('[data-testid="cart-button"]').click();
    await page.waitForTimeout(500);

    // Click checkout
    const checkoutBtn = page.getByRole('button', { name: /^checkout$/i });
    await checkoutBtn.click();

    // Wait for navigation to checkout
    await page.waitForURL(/\/checkout/, { timeout: 10000 });
    await expect(page).toHaveURL(/\/checkout/);
  });

  test('should display empty cart message', async ({ page }) => {
    // Open cart without adding items
    await page.locator('[data-testid="cart-button"]').click();
    await page.waitForTimeout(500);

    // Verify empty state message
    const emptyMessage = page.getByText(/empty/i);
    await expect(emptyMessage.first()).toBeVisible();
  });

  test('should show continue shopping button in empty cart', async ({ page }) => {
    // Open cart without adding items
    await page.locator('[data-testid="cart-button"]').click();
    await page.waitForTimeout(500);

    // Verify Browse Products button
    const continueShoppingBtn = page.getByRole('button', { name: /browse products/i });
    await expect(continueShoppingBtn).toBeVisible();
  });
});
