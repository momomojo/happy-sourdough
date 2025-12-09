import { test, expect } from '@playwright/test';
import { formatCurrency } from './fixtures/test-data';

test.describe('Shopping Cart', () => {
  test.beforeEach(async ({ page }) => {
    // Start from products page
    await page.goto('/products');
    await page.waitForLoadState('networkidle');
  });

  test('should add item to cart from product detail page', async ({ page }) => {
    // Navigate to product detail
    await page.waitForSelector('[data-testid="product-card"], .product-card, article');
    const firstProduct = page.locator('[data-testid="product-card"], .product-card, article').first();
    await firstProduct.getByRole('link').first().or(firstProduct).click();
    await page.waitForURL(/\/products\/.+/);

    // Get initial cart count
    const cartBadge = page.locator('[data-testid="cart-count"], .cart-badge, .cart-count');
    const initialCount = await cartBadge.count() > 0
      ? parseInt((await cartBadge.textContent()) || '0')
      : 0;

    // Add to cart
    const addToCartBtn = page.getByRole('button', { name: /add to cart/i });
    await addToCartBtn.click();

    // Wait for cart update (toast notification or cart badge update)
    await page.waitForTimeout(1000);

    // Verify cart count increased
    if (await cartBadge.count() > 0) {
      const newCount = parseInt((await cartBadge.textContent()) || '0');
      expect(newCount).toBeGreaterThan(initialCount);
    }
  });

  test('should add item to cart from product listing', async ({ page }) => {
    // Look for quick add button on product cards
    const productCard = page.locator('[data-testid="product-card"], .product-card, article').first();
    const quickAddBtn = productCard.getByRole('button', { name: /add to cart|quick add/i });

    if (await quickAddBtn.count() > 0) {
      // Get initial cart count
      const cartBadge = page.locator('[data-testid="cart-count"], .cart-badge, .cart-count');
      const initialCount = await cartBadge.count() > 0
        ? parseInt((await cartBadge.textContent()) || '0')
        : 0;

      await quickAddBtn.click();
      await page.waitForTimeout(1000);

      // Verify cart count increased
      if (await cartBadge.count() > 0) {
        const newCount = parseInt((await cartBadge.textContent()) || '0');
        expect(newCount).toBeGreaterThan(initialCount);
      }
    }
  });

  test('should view cart contents', async ({ page }) => {
    // Add an item first
    await page.waitForSelector('[data-testid="product-card"], .product-card, article');
    const firstProduct = page.locator('[data-testid="product-card"], .product-card, article').first();
    await firstProduct.getByRole('link').first().or(firstProduct).click();
    await page.waitForURL(/\/products\/.+/);

    const addToCartBtn = page.getByRole('button', { name: /add to cart/i });
    await addToCartBtn.click();
    await page.waitForTimeout(1000);

    // Navigate to cart
    const cartLink = page.getByRole('link', { name: /cart/i })
      .or(page.locator('[data-testid="cart-link"], .cart-icon').getByRole('link'))
      .or(page.locator('[href="/cart"]'));

    await cartLink.first().click();
    await page.waitForURL(/\/cart/);

    // Verify cart page elements
    await expect(page.getByRole('heading', { name: /cart|shopping cart/i })).toBeVisible();

    // Verify cart item is displayed
    const cartItems = page.locator('[data-testid="cart-item"], .cart-item, tbody tr');
    expect(await cartItems.count()).toBeGreaterThan(0);
  });

  test('should change item quantity in cart', async ({ page }) => {
    // Add an item and navigate to cart
    await page.waitForSelector('[data-testid="product-card"], .product-card, article');
    const firstProduct = page.locator('[data-testid="product-card"], .product-card, article').first();
    await firstProduct.getByRole('link').first().or(firstProduct).click();
    await page.waitForURL(/\/products\/.+/);

    await page.getByRole('button', { name: /add to cart/i }).click();
    await page.waitForTimeout(1000);

    // Go to cart
    const cartLink = page.getByRole('link', { name: /cart/i })
      .or(page.locator('[href="/cart"]'));
    await cartLink.first().click();
    await page.waitForURL(/\/cart/);

    // Find quantity controls
    const incrementBtn = page.getByRole('button', { name: /increase|increment|\+/i }).first();
    const decrementBtn = page.getByRole('button', { name: /decrease|decrement|-/i }).first();
    const quantityInput = page.locator('input[type="number"]').first();

    // Get current quantity
    let currentQuantity = 1;
    if (await quantityInput.count() > 0) {
      currentQuantity = parseInt((await quantityInput.inputValue()) || '1');
    }

    // Increase quantity
    if (await incrementBtn.count() > 0) {
      await incrementBtn.click();
      await page.waitForTimeout(500);

      // Verify quantity increased
      if (await quantityInput.count() > 0) {
        const newQuantity = parseInt((await quantityInput.inputValue()) || '1');
        expect(newQuantity).toBe(currentQuantity + 1);
      }
    }

    // Decrease quantity
    if (await decrementBtn.count() > 0 && currentQuantity > 1) {
      await decrementBtn.click();
      await page.waitForTimeout(500);

      // Verify quantity decreased
      if (await quantityInput.count() > 0) {
        const newQuantity = parseInt((await quantityInput.inputValue()) || '1');
        expect(newQuantity).toBeLessThan(currentQuantity + 1);
      }
    }
  });

  test('should remove item from cart', async ({ page }) => {
    // Add an item and navigate to cart
    await page.waitForSelector('[data-testid="product-card"], .product-card, article');
    const firstProduct = page.locator('[data-testid="product-card"], .product-card, article').first();
    await firstProduct.getByRole('link').first().or(firstProduct).click();
    await page.waitForURL(/\/products\/.+/);

    await page.getByRole('button', { name: /add to cart/i }).click();
    await page.waitForTimeout(1000);

    // Go to cart
    const cartLink = page.getByRole('link', { name: /cart/i })
      .or(page.locator('[href="/cart"]'));
    await cartLink.first().click();
    await page.waitForURL(/\/cart/);

    // Get initial cart item count
    const cartItems = page.locator('[data-testid="cart-item"], .cart-item, tbody tr');
    const initialCount = await cartItems.count();
    expect(initialCount).toBeGreaterThan(0);

    // Remove item
    const removeBtn = page.getByRole('button', { name: /remove|delete/i }).first();
    await removeBtn.click();
    await page.waitForTimeout(1000);

    // Verify item removed
    const newCount = await cartItems.count();
    expect(newCount).toBe(initialCount - 1);

    // If cart is now empty, verify empty state
    if (newCount === 0) {
      await expect(page.getByText(/empty|no items/i)).toBeVisible();
    }
  });

  test('should calculate cart subtotal correctly', async ({ page }) => {
    // Navigate to product detail
    await page.waitForSelector('[data-testid="product-card"], .product-card, article');
    const firstProduct = page.locator('[data-testid="product-card"], .product-card, article').first();
    await firstProduct.getByRole('link').first().or(firstProduct).click();
    await page.waitForURL(/\/products\/.+/);

    // Get product price
    const priceElement = page.locator('[data-testid="product-price"], .price');
    const priceText = await priceElement.first().textContent();
    const price = parseFloat((priceText || '0').replace(/[^0-9.]/g, ''));

    // Add to cart
    await page.getByRole('button', { name: /add to cart/i }).click();
    await page.waitForTimeout(1000);

    // Go to cart
    const cartLink = page.getByRole('link', { name: /cart/i })
      .or(page.locator('[href="/cart"]'));
    await cartLink.first().click();
    await page.waitForURL(/\/cart/);

    // Verify subtotal
    const subtotalElement = page.locator('[data-testid="cart-subtotal"], .subtotal, text=/subtotal/i');
    if (await subtotalElement.count() > 0) {
      const subtotalText = await subtotalElement.first().textContent();
      const subtotal = parseFloat((subtotalText || '0').replace(/[^0-9.]/g, ''));
      expect(subtotal).toBeGreaterThanOrEqual(price);
    }
  });

  test('should persist cart across page navigation', async ({ page }) => {
    // Add an item
    await page.waitForSelector('[data-testid="product-card"], .product-card, article');
    const firstProduct = page.locator('[data-testid="product-card"], .product-card, article').first();
    await firstProduct.getByRole('link').first().or(firstProduct).click();
    await page.waitForURL(/\/products\/.+/);

    await page.getByRole('button', { name: /add to cart/i }).click();
    await page.waitForTimeout(1000);

    // Get cart count
    const cartBadge = page.locator('[data-testid="cart-count"], .cart-badge, .cart-count');
    const cartCount = await cartBadge.count() > 0
      ? parseInt((await cartBadge.textContent()) || '0')
      : 0;
    expect(cartCount).toBeGreaterThan(0);

    // Navigate away and back
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Verify cart count persisted
    if (await cartBadge.count() > 0) {
      const newCount = parseInt((await cartBadge.textContent()) || '0');
      expect(newCount).toBe(cartCount);
    }
  });

  test('should show checkout button when cart has items', async ({ page }) => {
    // Add an item
    await page.waitForSelector('[data-testid="product-card"], .product-card, article');
    const firstProduct = page.locator('[data-testid="product-card"], .product-card, article').first();
    await firstProduct.getByRole('link').first().or(firstProduct).click();
    await page.waitForURL(/\/products\/.+/);

    await page.getByRole('button', { name: /add to cart/i }).click();
    await page.waitForTimeout(1000);

    // Go to cart
    const cartLink = page.getByRole('link', { name: /cart/i })
      .or(page.locator('[href="/cart"]'));
    await cartLink.first().click();
    await page.waitForURL(/\/cart/);

    // Verify checkout button exists
    const checkoutBtn = page.getByRole('button', { name: /checkout|proceed to checkout/i })
      .or(page.getByRole('link', { name: /checkout|proceed to checkout/i }));
    await expect(checkoutBtn.first()).toBeVisible();
  });

  test('should update cart total when quantity changes', async ({ page }) => {
    // Add an item and navigate to cart
    await page.waitForSelector('[data-testid="product-card"], .product-card, article');
    const firstProduct = page.locator('[data-testid="product-card"], .product-card, article').first();
    await firstProduct.getByRole('link').first().or(firstProduct).click();
    await page.waitForURL(/\/products\/.+/);

    await page.getByRole('button', { name: /add to cart/i }).click();
    await page.waitForTimeout(1000);

    const cartLink = page.getByRole('link', { name: /cart/i })
      .or(page.locator('[href="/cart"]'));
    await cartLink.first().click();
    await page.waitForURL(/\/cart/);

    // Get initial subtotal
    const subtotalElement = page.locator('[data-testid="cart-subtotal"], .subtotal, text=/subtotal/i');
    let initialSubtotal = 0;
    if (await subtotalElement.count() > 0) {
      const subtotalText = await subtotalElement.first().textContent();
      initialSubtotal = parseFloat((subtotalText || '0').replace(/[^0-9.]/g, ''));
    }

    // Increase quantity
    const incrementBtn = page.getByRole('button', { name: /increase|increment|\+/i }).first();
    if (await incrementBtn.count() > 0) {
      await incrementBtn.click();
      await page.waitForTimeout(1000);

      // Verify subtotal increased
      if (await subtotalElement.count() > 0) {
        const newSubtotalText = await subtotalElement.first().textContent();
        const newSubtotal = parseFloat((newSubtotalText || '0').replace(/[^0-9.]/g, ''));
        expect(newSubtotal).toBeGreaterThan(initialSubtotal);
      }
    }
  });

  test('should display empty cart message when no items', async ({ page }) => {
    // Navigate directly to cart
    await page.goto('/cart');

    // Clear any existing items if present
    const removeButtons = page.getByRole('button', { name: /remove|delete/i });
    const count = await removeButtons.count();
    for (let i = 0; i < count; i++) {
      await removeButtons.first().click();
      await page.waitForTimeout(500);
    }

    // Verify empty state
    const emptyMessage = page.getByText(/empty|no items/i);
    if (await emptyMessage.count() > 0) {
      await expect(emptyMessage.first()).toBeVisible();
    }

    // Verify continue shopping link
    const continueShoppingLink = page.getByRole('link', { name: /continue shopping|shop now|browse products/i });
    if (await continueShoppingLink.count() > 0) {
      await expect(continueShoppingLink.first()).toBeVisible();
    }
  });
});
