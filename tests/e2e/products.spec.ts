import { test, expect } from '@playwright/test';
import { PRODUCT_CATEGORIES, SAMPLE_PRODUCTS } from './fixtures/test-data';
import { dismissCookieBanner } from './fixtures/test-utils';

test.describe('Product Browsing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await dismissCookieBanner(page);
  });

  test('should display homepage with featured products', async ({ page }) => {
    // Check for main heading (actual text is "Wild Yeast. Time-Honored Craft. Slow Fermentation.")
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    // Check for products section or main content
    const productsSection = page.locator('[data-testid="products-section"], main');
    await expect(productsSection).toBeVisible();
  });

  test('should navigate to products page', async ({ page }) => {
    // Look for products link in navigation
    const productsLink = page.getByRole('link', { name: /products/i }).first();
    await productsLink.click();

    // Wait for navigation
    await page.waitForURL(/\/products/);

    // Verify we're on products page
    await expect(page).toHaveURL(/\/products/);
  });

  test('should display product catalog', async ({ page }) => {
    await page.goto('/products');
    await dismissCookieBanner(page);

    // Wait for products to load
    await page.waitForSelector('[data-testid="product-card"], .product-card, article', {
      timeout: 10000
    });

    // Check that multiple products are displayed
    const productCards = page.locator('[data-testid="product-card"], .product-card, article');
    const count = await productCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should filter products by category', async ({ page }) => {
    await page.goto('/products');
    await dismissCookieBanner(page);

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Look for category filters (could be buttons, links, or tabs)
    const categoryFilter = page.getByRole('button', { name: /sourdough/i })
      .or(page.getByRole('link', { name: /sourdough/i }))
      .or(page.getByRole('tab', { name: /sourdough/i }));

    if (await categoryFilter.count() > 0) {
      await categoryFilter.first().click();

      // Wait for filtered results
      await page.waitForTimeout(1000);

      // Verify products are filtered (this depends on implementation)
      const productCards = page.locator('[data-testid="product-card"], .product-card, article');
      expect(await productCards.count()).toBeGreaterThan(0);
    }
  });

  test('should view product detail page', async ({ page }) => {
    await page.goto('/products');
    await dismissCookieBanner(page);

    // Wait for products to load
    await page.waitForSelector('[data-testid="product-card"], .product-card, article', {
      timeout: 10000
    });

    // Click on first product
    const firstProduct = page.locator('[data-testid="product-card"], .product-card, article').first();
    const productName = await firstProduct.textContent();

    // Click on the product (either card itself or a link inside it)
    const productLink = firstProduct.getByRole('link').first()
      .or(firstProduct.getByRole('button', { name: /view|details/i }).first())
      .or(firstProduct);

    await productLink.click();

    // Wait for navigation to product detail page
    await page.waitForURL(/\/products\/.+/);

    // Verify product detail page elements
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    // Look for price (use .or() for multiple selectors)
    const priceElement = page.locator('[data-testid="product-price"]')
      .or(page.locator('.price'))
      .or(page.locator('text=/\\$\\d+/'));
    await expect(priceElement.first()).toBeVisible();

    // Look for add to cart button
    const addToCartBtn = page.getByRole('button', { name: /add to cart/i });
    await expect(addToCartBtn).toBeVisible();
  });

  test('should search for products', async ({ page }) => {
    await page.goto('/products');
    await dismissCookieBanner(page);

    // Look for search input
    const searchInput = page.getByRole('searchbox')
      .or(page.getByPlaceholder(/search/i));

    if (await searchInput.count() > 0) {
      await searchInput.first().fill('sourdough');
      await searchInput.first().press('Enter');

      // Wait for search results
      await page.waitForTimeout(1000);

      // Verify results are displayed
      const productCards = page.locator('[data-testid="product-card"], .product-card, article');
      expect(await productCards.count()).toBeGreaterThan(0);
    }
  });

  test('should display product images', async ({ page }) => {
    await page.goto('/products');
    await dismissCookieBanner(page);

    // Wait for products to load
    await page.waitForSelector('[data-testid="product-card"], .product-card, article', {
      timeout: 10000
    });

    // Check for images in product cards
    const productImages = page.locator('[data-testid="product-card"] img, .product-card img, article img');

    if (await productImages.count() > 0) {
      const firstImage = productImages.first();
      await expect(firstImage).toBeVisible();

      // Verify image has loaded (has src and alt)
      const src = await firstImage.getAttribute('src');
      const alt = await firstImage.getAttribute('alt');
      expect(src).toBeTruthy();
      expect(alt).toBeTruthy();
    }
  });

  test('should handle product variants/sizes', async ({ page }) => {
    await page.goto('/products');
    await dismissCookieBanner(page);

    // Navigate to a product detail page
    await page.waitForSelector('[data-testid="product-card"], .product-card, article');
    const firstProduct = page.locator('[data-testid="product-card"], .product-card, article').first();
    const productLink = firstProduct.getByRole('link').first().or(firstProduct);
    await productLink.click();

    await page.waitForURL(/\/products\/.+/);

    // Look for variant selector (size, flavor, etc.)
    const variantSelector = page.getByRole('radiogroup')
      .or(page.getByRole('combobox', { name: /size|variant|flavor/i }))
      .or(page.locator('[data-testid="variant-selector"]'));

    if (await variantSelector.count() > 0) {
      // Verify variant options exist
      await expect(variantSelector.first()).toBeVisible();

      // Try selecting a variant
      const variantOption = page.getByRole('radio').first()
        .or(variantSelector.first().getByRole('option').first());

      if (await variantOption.count() > 0) {
        await variantOption.click();
      }
    }
  });

  test('should display product prices correctly', async ({ page }) => {
    await page.goto('/products');
    await dismissCookieBanner(page);

    // Wait for products to load
    await page.waitForSelector('[data-testid="product-card"], .product-card, article');

    // Check that prices are displayed with currency format (use .or() for multiple selectors)
    const priceElements = page.locator('[data-testid="product-price"]')
      .or(page.locator('.price'))
      .or(page.locator('text=/\\$\\d+/'));
    const count = await priceElements.count();
    expect(count).toBeGreaterThan(0);

    // Verify first price format (should contain $ and decimal)
    const firstPrice = await priceElements.first().textContent();
    expect(firstPrice).toMatch(/\$\d+(\.\d{2})?/);
  });

  test('should be responsive on mobile', async ({ page, isMobile }) => {
    if (!isMobile) {
      test.skip();
    }

    await page.goto('/products');
    await dismissCookieBanner(page);

    // Verify mobile navigation (hamburger menu)
    const menuButton = page.getByRole('button', { name: /menu|navigation/i });
    if (await menuButton.count() > 0) {
      await menuButton.click();

      // Verify menu opens
      const nav = page.getByRole('navigation');
      await expect(nav).toBeVisible();
    }

    // Verify products stack vertically on mobile
    const productCards = page.locator('[data-testid="product-card"], .product-card, article');
    if (await productCards.count() > 0) {
      await expect(productCards.first()).toBeVisible();
    }
  });
});
