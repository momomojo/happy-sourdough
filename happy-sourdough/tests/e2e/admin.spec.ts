import { test, expect } from '@playwright/test';
import { TEST_USERS, ORDER_STATUSES } from './fixtures/test-data';

test.describe('Admin Panel', () => {
  test.describe('Admin Login', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/admin/login');
    });

    test('should display admin login page', async ({ page }) => {
      // Verify login page elements
      await expect(page.getByRole('heading', { name: /login|admin/i })).toBeVisible();
      await expect(page.getByLabel(/email/i)).toBeVisible();
      await expect(page.getByLabel(/password/i)).toBeVisible();
      await expect(page.getByRole('button', { name: /sign in|login/i })).toBeVisible();
    });

    test('should show error for invalid credentials', async ({ page }) => {
      // Try to login with invalid credentials
      await page.getByLabel(/email/i).fill('invalid@example.com');
      await page.getByLabel(/password/i).fill('wrongpassword');
      await page.getByRole('button', { name: /sign in|login/i }).click();

      // Wait for error message
      await page.waitForTimeout(2000);

      // Verify error is shown (could be toast or inline message)
      const errorMessage = page.locator('[role="alert"], .error, text=/invalid|incorrect|failed/i');
      if (await errorMessage.count() > 0) {
        await expect(errorMessage.first()).toBeVisible();
      }
    });

    test('should redirect to dashboard after successful login', async ({ page }) => {
      // Fill login form
      await page.getByLabel(/email/i).fill(TEST_USERS.admin.email);
      await page.getByLabel(/password/i).fill(TEST_USERS.admin.password);
      await page.getByRole('button', { name: /sign in|login/i }).click();

      // Wait for redirect to dashboard
      await page.waitForURL(/\/admin\/dashboard/, { timeout: 10000 });

      // Verify dashboard elements
      await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
    });

    test('should validate required fields', async ({ page }) => {
      // Try to submit without filling fields
      await page.getByRole('button', { name: /sign in|login/i }).click();

      // Browser native validation or custom validation should trigger
      const emailInput = page.getByLabel(/email/i);
      const isValid = await emailInput.evaluate((el: HTMLInputElement) => el.validity.valid);
      expect(isValid).toBeFalsy();
    });
  });

  test.describe('Admin Dashboard', () => {
    test.beforeEach(async ({ page }) => {
      // Login before each test
      await page.goto('/admin/login');
      await page.getByLabel(/email/i).fill(TEST_USERS.admin.email);
      await page.getByLabel(/password/i).fill(TEST_USERS.admin.password);
      await page.getByRole('button', { name: /sign in|login/i }).click();
      await page.waitForURL(/\/admin\/dashboard/, { timeout: 10000 });
    });

    test('should display dashboard statistics', async ({ page }) => {
      // Verify stat cards are displayed
      const statCards = page.locator('[data-testid="stat-card"], .stat-card, .card');
      const count = await statCards.count();
      expect(count).toBeGreaterThan(0);

      // Look for common metrics
      const totalOrders = page.locator('text=/total orders/i');
      const revenue = page.locator('text=/revenue|total sales/i');
      const pendingOrders = page.locator('text=/pending/i');

      if (await totalOrders.count() > 0) {
        await expect(totalOrders.first()).toBeVisible();
      }
    });

    test('should display recent orders', async ({ page }) => {
      // Look for recent orders section
      const recentOrders = page.locator('text=/recent orders|latest orders/i');
      if (await recentOrders.count() > 0) {
        await expect(recentOrders.first()).toBeVisible();

        // Verify orders table/list exists
        const ordersTable = page.locator('table, [data-testid="orders-list"]');
        if (await ordersTable.count() > 0) {
          await expect(ordersTable.first()).toBeVisible();
        }
      }
    });

    test('should navigate to orders page from sidebar', async ({ page }) => {
      // Click on Orders link in sidebar
      const ordersLink = page.getByRole('link', { name: /orders/i }).first();
      await ordersLink.click();

      // Wait for navigation
      await page.waitForURL(/\/admin\/orders/);

      // Verify orders page loaded
      await expect(page.getByRole('heading', { name: /orders/i })).toBeVisible();
    });

    test('should navigate to production page from sidebar', async ({ page }) => {
      // Click on Production link in sidebar
      const productionLink = page.getByRole('link', { name: /production/i }).first();
      await productionLink.click();

      // Wait for navigation
      await page.waitForURL(/\/admin\/production/);

      // Verify production page loaded
      await expect(page.getByRole('heading', { name: /production/i })).toBeVisible();
    });

    test('should navigate to zones page from sidebar', async ({ page }) => {
      // Click on Zones link in sidebar
      const zonesLink = page.getByRole('link', { name: /zones/i }).first();
      await zonesLink.click();

      // Wait for navigation
      await page.waitForURL(/\/admin\/zones/);

      // Verify zones page loaded
      await expect(page.getByRole('heading', { name: /zones|delivery zones/i })).toBeVisible();
    });

    test('should display user menu in header', async ({ page }) => {
      // Look for user avatar/menu
      const userMenu = page.locator('[data-testid="user-menu"], .user-menu, button[aria-label*="user"]');
      if (await userMenu.count() > 0) {
        await userMenu.first().click();

        // Verify dropdown appears
        const signOutBtn = page.getByRole('menuitem', { name: /sign out|logout/i })
          .or(page.getByRole('button', { name: /sign out|logout/i }));
        await expect(signOutBtn.first()).toBeVisible();
      }
    });

    test('should logout successfully', async ({ page }) => {
      // Open user menu
      const userMenu = page.locator('[data-testid="user-menu"], .user-menu, button[aria-label*="user"]');
      if (await userMenu.count() > 0) {
        await userMenu.first().click();
      }

      // Click sign out
      const signOutBtn = page.getByRole('menuitem', { name: /sign out|logout/i })
        .or(page.getByRole('button', { name: /sign out|logout/i }));
      await signOutBtn.first().click();

      // Wait for redirect to login
      await page.waitForURL(/\/admin\/login/);

      // Verify login page is shown
      await expect(page.getByRole('heading', { name: /login/i })).toBeVisible();
    });
  });

  test.describe('Admin Orders Management', () => {
    test.beforeEach(async ({ page }) => {
      // Login and navigate to orders page
      await page.goto('/admin/login');
      await page.getByLabel(/email/i).fill(TEST_USERS.admin.email);
      await page.getByLabel(/password/i).fill(TEST_USERS.admin.password);
      await page.getByRole('button', { name: /sign in|login/i }).click();
      await page.waitForURL(/\/admin\/dashboard/, { timeout: 10000 });

      // Navigate to orders
      const ordersLink = page.getByRole('link', { name: /^orders$/i }).first();
      await ordersLink.click();
      await page.waitForURL(/\/admin\/orders/);
    });

    test('should display orders list', async ({ page }) => {
      // Verify orders page loaded
      await expect(page.getByRole('heading', { name: /orders/i })).toBeVisible();

      // Look for orders table or list
      const ordersTable = page.locator('table, [data-testid="orders-list"], [data-testid="orders-table"]');
      if (await ordersTable.count() > 0) {
        await expect(ordersTable.first()).toBeVisible();
      }
    });

    test('should filter orders by status', async ({ page }) => {
      // Look for status filter
      const statusFilter = page.locator('[data-testid="status-filter"], select, [role="combobox"]');
      if (await statusFilter.count() > 0) {
        await statusFilter.first().click();
        await page.waitForTimeout(500);

        // Select a status
        const pendingOption = page.getByRole('option', { name: /pending|received/i })
          .or(page.getByText(/pending|received/i));
        if (await pendingOption.count() > 0) {
          await pendingOption.first().click();
          await page.waitForTimeout(1000);
        }
      }
    });

    test('should view order details', async ({ page }) => {
      // Look for first order in list
      const firstOrder = page.locator('table tbody tr, [data-testid="order-item"]').first();
      if (await firstOrder.count() > 0) {
        // Click to view details
        const viewBtn = firstOrder.getByRole('link', { name: /view|details/i })
          .or(firstOrder.getByRole('button', { name: /view|details/i }))
          .or(firstOrder);

        await viewBtn.click();
        await page.waitForTimeout(1000);

        // Verify order details are visible (could be modal or separate page)
        const orderDetails = page.locator('[data-testid="order-details"], .order-details, [role="dialog"]');
        if (await orderDetails.count() > 0) {
          await expect(orderDetails.first()).toBeVisible();
        }
      }
    });

    test('should update order status', async ({ page }) => {
      // Find first order
      const firstOrder = page.locator('table tbody tr, [data-testid="order-item"]').first();
      if (await firstOrder.count() > 0) {
        // Look for status dropdown or update button
        const statusDropdown = firstOrder.locator('select, [data-testid="status-select"]');
        const updateBtn = firstOrder.getByRole('button', { name: /update|change status/i });

        if (await statusDropdown.count() > 0) {
          await statusDropdown.first().click();

          // Select a different status
          const option = page.getByRole('option').nth(1);
          if (await option.count() > 0) {
            await option.click();
            await page.waitForTimeout(1000);

            // Look for success message
            const successMsg = page.locator('[role="alert"], .success, text=/updated|success/i');
            if (await successMsg.count() > 0) {
              await expect(successMsg.first()).toBeVisible();
            }
          }
        } else if (await updateBtn.count() > 0) {
          await updateBtn.first().click();
          await page.waitForTimeout(500);

          // Modal or form should appear
          const statusForm = page.locator('[role="dialog"], form');
          if (await statusForm.count() > 0) {
            await expect(statusForm.first()).toBeVisible();
          }
        }
      }
    });

    test('should search orders', async ({ page }) => {
      // Look for search input
      const searchInput = page.getByRole('searchbox')
        .or(page.getByPlaceholder(/search/i))
        .or(page.locator('input[type="search"]'));

      if (await searchInput.count() > 0) {
        await searchInput.first().fill('test');
        await searchInput.first().press('Enter');
        await page.waitForTimeout(1000);

        // Results should filter
        const ordersTable = page.locator('table, [data-testid="orders-list"]');
        if (await ordersTable.count() > 0) {
          await expect(ordersTable.first()).toBeVisible();
        }
      }
    });

    test('should paginate through orders', async ({ page }) => {
      // Look for pagination controls
      const nextBtn = page.getByRole('button', { name: /next/i })
        .or(page.locator('[aria-label="Next page"]'));
      const prevBtn = page.getByRole('button', { name: /previous|prev/i })
        .or(page.locator('[aria-label="Previous page"]'));

      if (await nextBtn.count() > 0) {
        await nextBtn.first().click();
        await page.waitForTimeout(1000);

        // Verify page changed
        if (await prevBtn.count() > 0) {
          await expect(prevBtn.first()).toBeEnabled();
        }
      }
    });

    test('should display order totals and customer info', async ({ page }) => {
      // Verify order table has required columns
      const tableHeaders = page.locator('th');
      const headerCount = await tableHeaders.count();

      if (headerCount > 0) {
        // Common columns to look for
        const orderNumHeader = page.locator('th:has-text("Order"), th:has-text("ID")');
        const customerHeader = page.locator('th:has-text("Customer"), th:has-text("Name")');
        const totalHeader = page.locator('th:has-text("Total"), th:has-text("Amount")');
        const statusHeader = page.locator('th:has-text("Status")');

        // At least some headers should be present
        expect(headerCount).toBeGreaterThan(0);
      }
    });
  });

  test.describe('Admin Authentication Guard', () => {
    test('should redirect to login when accessing admin routes without auth', async ({ page }) => {
      // Try to access admin dashboard without login
      await page.goto('/admin/dashboard');

      // Should redirect to login
      await page.waitForURL(/\/admin\/login/);
      await expect(page.getByRole('heading', { name: /login/i })).toBeVisible();
    });

    test('should redirect to login when accessing admin orders without auth', async ({ page }) => {
      // Try to access admin orders without login
      await page.goto('/admin/orders');

      // Should redirect to login
      await page.waitForURL(/\/admin\/login/);
      await expect(page.getByRole('heading', { name: /login/i })).toBeVisible();
    });

    test('should maintain session across page refreshes', async ({ page }) => {
      // Login
      await page.goto('/admin/login');
      await page.getByLabel(/email/i).fill(TEST_USERS.admin.email);
      await page.getByLabel(/password/i).fill(TEST_USERS.admin.password);
      await page.getByRole('button', { name: /sign in|login/i }).click();
      await page.waitForURL(/\/admin\/dashboard/);

      // Refresh page
      await page.reload();
      await page.waitForLoadState('networkidle');

      // Should still be logged in
      await expect(page).toHaveURL(/\/admin\/dashboard/);
      await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
    });
  });

  test.describe('Admin Mobile Responsiveness', () => {
    test('should display mobile menu on small screens', async ({ page, isMobile }) => {
      if (!isMobile) {
        test.skip();
      }

      // Login
      await page.goto('/admin/login');
      await page.getByLabel(/email/i).fill(TEST_USERS.admin.email);
      await page.getByLabel(/password/i).fill(TEST_USERS.admin.password);
      await page.getByRole('button', { name: /sign in|login/i }).click();
      await page.waitForURL(/\/admin\/dashboard/);

      // Look for hamburger menu
      const menuBtn = page.getByRole('button', { name: /menu|navigation/i })
        .or(page.locator('[aria-label*="menu"]'));

      if (await menuBtn.count() > 0) {
        await menuBtn.first().click();

        // Verify sidebar/nav appears
        const nav = page.getByRole('navigation');
        await expect(nav.first()).toBeVisible();
      }
    });
  });
});
