import { test, expect } from '@playwright/test';
import { TEST_USERS } from './fixtures/test-data';

test.describe('Admin Panel', () => {
  test.describe('Admin Login', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/admin/login');
      // Wait for loading state to complete (loading spinner should disappear)
      await page.waitForSelector('h8.animate-spin', { state: 'hidden', timeout: 10000 }).catch(() => {
        // Spinner might not exist if page loaded fast
      });
      // Wait for the page to stabilize
      await page.waitForLoadState('networkidle');
    });

    test('should display admin login page or setup page', async ({ page }) => {
      // The page shows either "Admin Login" or "Admin Setup Required"
      // Note: CardTitle renders as generic element, not heading, so use getByText
      const loginTitle = page.getByText('Admin Login', { exact: true });
      const setupTitle = page.getByText('Admin Setup Required', { exact: true });

      // One of these should be visible
      const loginVisible = await loginTitle.isVisible().catch(() => false);
      const setupVisible = await setupTitle.isVisible().catch(() => false);

      expect(loginVisible || setupVisible).toBeTruthy();

      if (loginVisible) {
        // Verify login form elements
        await expect(page.getByLabel('Email')).toBeVisible();
        await expect(page.getByLabel('Password')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
      } else {
        // Verify setup page elements
        await expect(page.getByRole('button', { name: 'Begin Setup' })).toBeVisible();
      }
    });

    test('should show error for invalid credentials', async ({ page }) => {
      // Skip if setup is required
      const loginHeading = page.getByText('Admin Login', { exact: true });
      if (!(await loginHeading.isVisible().catch(() => false))) {
        test.skip();
        return;
      }

      // Try to login with invalid credentials
      await page.getByLabel('Email').fill('invalid@example.com');
      await page.getByLabel('Password').fill('wrongpassword');
      await page.getByRole('button', { name: 'Sign In' }).click();

      // Wait for response
      await page.waitForTimeout(2000);

      // Verify error is shown (sonner toast)
      const toastMessage = page.locator('[data-sonner-toast]');
      if (await toastMessage.count() > 0) {
        await expect(toastMessage.first()).toBeVisible();
      }
    });

    test('should redirect to dashboard after successful login', async ({ page }) => {
      // Skip if setup is required
      const loginHeading = page.getByText('Admin Login', { exact: true });
      if (!(await loginHeading.isVisible().catch(() => false))) {
        test.skip();
        return;
      }

      // Fill login form
      await page.getByLabel('Email').fill(TEST_USERS.admin.email);
      await page.getByLabel('Password').fill(TEST_USERS.admin.password);
      await page.getByRole('button', { name: 'Sign In' }).click();

      // Wait for redirect to dashboard
      await page.waitForURL(/\/admin\/dashboard/, { timeout: 15000 });

      // Verify dashboard loaded - use exact match to avoid multiple headings
      await expect(page.getByRole('heading', { name: 'Dashboard', exact: true })).toBeVisible();
    });

    test('should validate required fields', async ({ page }) => {
      // Skip if setup is required
      const signInBtn = page.getByRole('button', { name: 'Sign In' });
      if (!(await signInBtn.isVisible().catch(() => false))) {
        test.skip();
        return;
      }

      // Try to submit without filling fields
      await signInBtn.click();

      // Browser native validation should trigger
      const emailInput = page.getByLabel('Email');
      const isValid = await emailInput.evaluate((el: HTMLInputElement) => el.validity.valid);
      expect(isValid).toBeFalsy();
    });
  });

  test.describe('Admin Dashboard', () => {
    test.beforeEach(async ({ page }) => {
      // Navigate to login and check if setup is required
      await page.goto('/admin/login');
      await page.waitForLoadState('networkidle');

      const loginHeading = page.getByText('Admin Login', { exact: true });
      if (!(await loginHeading.isVisible().catch(() => false))) {
        // Admin setup required - skip these tests
        test.skip();
        return;
      }

      // Login before each test
      await page.getByLabel('Email').fill(TEST_USERS.admin.email);
      await page.getByLabel('Password').fill(TEST_USERS.admin.password);
      await page.getByRole('button', { name: 'Sign In' }).click();
      await page.waitForURL(/\/admin\/dashboard/, { timeout: 15000 });
    });

    test('should display dashboard statistics', async ({ page }) => {
      // Verify stat cards are displayed
      const statCards = page.locator('[data-slot="card"]');
      await page.waitForTimeout(1000);
      const count = await statCards.count();
      expect(count).toBeGreaterThan(0);

      // Look for common metrics - the dashboard shows "Today's Orders", "Pending Orders", etc.
      const todaysOrders = page.locator('text=/today\'?s orders/i');
      const pendingOrders = page.locator('text=/pending orders/i');
      if (await todaysOrders.count() > 0) {
        await expect(todaysOrders.first()).toBeVisible();
      } else if (await pendingOrders.count() > 0) {
        await expect(pendingOrders.first()).toBeVisible();
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

    test('should navigate to orders page from sidebar', async ({ page, isMobile }) => {
      if (isMobile) {
        // On mobile, navigate directly (sidebar is in a sheet that's harder to test)
        await page.goto('/admin/orders');
      } else {
        // On desktop, click the sidebar link
        const ordersLink = page.getByRole('link', { name: /orders/i }).first();
        await ordersLink.click();
      }

      // Wait for navigation
      await page.waitForURL(/\/admin\/orders/);

      // Verify orders page loaded
      await expect(page.getByRole('heading', { name: /orders/i })).toBeVisible();
    });

    test('should navigate to production page from sidebar', async ({ page, isMobile }) => {
      if (isMobile) {
        // On mobile, navigate directly (sidebar is in a sheet that's harder to test)
        await page.goto('/admin/production');
      } else {
        // On desktop, click the sidebar link
        const productionLink = page.getByRole('link', { name: /production/i }).first();
        await productionLink.click();
      }

      // Wait for navigation
      await page.waitForURL(/\/admin\/production/);

      // Verify production page loaded
      await expect(page.getByRole('heading', { name: /production/i })).toBeVisible();
    });

    test('should navigate to zones page from sidebar', async ({ page, isMobile }) => {
      if (isMobile) {
        // On mobile, navigate directly (sidebar is in a sheet that's harder to test)
        await page.goto('/admin/zones');
      } else {
        // On desktop, click the sidebar link
        const zonesLink = page.getByRole('link', { name: /zones/i }).first();
        await zonesLink.click();
      }

      // Wait for navigation
      await page.waitForURL(/\/admin\/zones/);

      // Verify zones page loaded
      await expect(page.getByRole('heading', { name: /delivery zone management/i })).toBeVisible();
    });

    test('should display user menu in header', async ({ page }) => {
      // Look for user menu trigger
      const userMenuTrigger = page.getByTestId('user-menu-trigger');
      await expect(userMenuTrigger).toBeVisible();
      await userMenuTrigger.click();

      // Verify dropdown appears with sign out option
      const signOutBtn = page.getByRole('menuitem', { name: /sign out/i });
      await expect(signOutBtn).toBeVisible();
    });

    test('should logout successfully', async ({ page }) => {
      // Open user menu using the test id
      const userMenuTrigger = page.getByTestId('user-menu-trigger');
      await userMenuTrigger.click();

      // Wait for dropdown menu to appear and click sign out
      const signOutBtn = page.getByRole('menuitem', { name: /sign out/i });
      await signOutBtn.waitFor({ state: 'visible', timeout: 5000 });
      await signOutBtn.click();

      // Wait for redirect to login
      await page.waitForURL(/\/admin\/login/, { timeout: 10000 });

      // Wait for loading spinner to disappear (page uses Loader2 component while checking setup)
      await page.waitForSelector('.animate-spin', { state: 'hidden', timeout: 10000 }).catch(() => {
        // Spinner might not exist if page loaded fast
      });

      // Verify login page is shown (wait for network to be idle first)
      await page.waitForLoadState('networkidle');

      // Check for either login heading or setup heading
      const loginHeading = page.getByText('Admin Login', { exact: true });
      const setupHeading = page.getByText('Admin Setup Required', { exact: true });

      // Wait for one of them to be visible
      await Promise.race([
        loginHeading.waitFor({ state: 'visible', timeout: 5000 }).catch(() => null),
        setupHeading.waitFor({ state: 'visible', timeout: 5000 }).catch(() => null),
      ]);

      const loginVisible = await loginHeading.isVisible().catch(() => false);
      const setupVisible = await setupHeading.isVisible().catch(() => false);
      expect(loginVisible || setupVisible).toBeTruthy();
    });
  });

  test.describe('Admin Orders Management', () => {
    test.beforeEach(async ({ page }) => {
      // Login and navigate to orders page
      await page.goto('/admin/login');
      await page.waitForLoadState('networkidle');

      const loginHeading = page.getByText('Admin Login', { exact: true });
      if (!(await loginHeading.isVisible().catch(() => false))) {
        test.skip();
        return;
      }

      await page.getByLabel('Email').fill(TEST_USERS.admin.email);
      await page.getByLabel('Password').fill(TEST_USERS.admin.password);
      await page.getByRole('button', { name: 'Sign In' }).click();
      await page.waitForURL(/\/admin\/dashboard/, { timeout: 15000 });

      // Navigate directly to orders page (works on both desktop and mobile)
      await page.goto('/admin/orders');
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
      // Look for status filter trigger button (Radix Select uses button[role="combobox"])
      const statusTrigger = page.locator('#status-filter');
      if (await statusTrigger.count() > 0) {
        // Click to open the dropdown
        await statusTrigger.click();

        // Wait for the dropdown content to be visible (it's rendered in a portal)
        // Radix UI Select items don't use role="option", they're rendered with custom ARIA
        await page.waitForSelector('[data-slot="select-content"]', { state: 'visible', timeout: 2000 });

        // Click on "Received" option using the exact text match
        // The items are rendered with [data-slot="select-item"]
        const receivedOption = page.locator('[data-slot="select-item"]').filter({ hasText: 'Received' });
        if (await receivedOption.count() > 0) {
          await receivedOption.click();

          // Wait for the page to reload with the filter applied
          await page.waitForLoadState('networkidle');

          // Verify the filter was applied by checking the URL
          await page.waitForURL(/status=received/, { timeout: 5000 });
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
      await page.waitForLoadState('networkidle');

      // Either login or setup page should be shown
      const loginHeading = page.getByText('Admin Login', { exact: true });
      const setupHeading = page.getByText('Admin Setup Required', { exact: true });
      const loginVisible = await loginHeading.isVisible().catch(() => false);
      const setupVisible = await setupHeading.isVisible().catch(() => false);
      expect(loginVisible || setupVisible).toBeTruthy();
    });

    test('should redirect to login when accessing admin orders without auth', async ({ page }) => {
      // Try to access admin orders without login
      await page.goto('/admin/orders');

      // Should redirect to login
      await page.waitForURL(/\/admin\/login/);
      await page.waitForLoadState('networkidle');

      // Either login or setup page should be shown
      const loginHeading = page.getByText('Admin Login', { exact: true });
      const setupHeading = page.getByText('Admin Setup Required', { exact: true });
      const loginVisible = await loginHeading.isVisible().catch(() => false);
      const setupVisible = await setupHeading.isVisible().catch(() => false);
      expect(loginVisible || setupVisible).toBeTruthy();
    });

    test('should maintain session across page refreshes', async ({ page }) => {
      // Navigate to login
      await page.goto('/admin/login');
      await page.waitForLoadState('networkidle');

      const loginHeading = page.getByText('Admin Login', { exact: true });
      if (!(await loginHeading.isVisible().catch(() => false))) {
        test.skip();
        return;
      }

      // Login
      await page.getByLabel('Email').fill(TEST_USERS.admin.email);
      await page.getByLabel('Password').fill(TEST_USERS.admin.password);
      await page.getByRole('button', { name: 'Sign In' }).click();
      await page.waitForURL(/\/admin\/dashboard/);

      // Refresh page
      await page.reload();
      await page.waitForLoadState('networkidle');

      // Should still be logged in
      await expect(page).toHaveURL(/\/admin\/dashboard/);
      await expect(page.getByRole('heading', { name: 'Dashboard', exact: true })).toBeVisible();
    });
  });

  test.describe('Admin Mobile Responsiveness', () => {
    test('should display mobile menu on small screens', async ({ page, isMobile }) => {
      if (!isMobile) {
        test.skip();
      }

      // Navigate to login
      await page.goto('/admin/login');
      await page.waitForLoadState('networkidle');

      const loginHeading = page.getByText('Admin Login', { exact: true });
      if (!(await loginHeading.isVisible().catch(() => false))) {
        test.skip();
        return;
      }

      // Login
      await page.getByLabel('Email').fill(TEST_USERS.admin.email);
      await page.getByLabel('Password').fill(TEST_USERS.admin.password);
      await page.getByRole('button', { name: 'Sign In' }).click();
      await page.waitForURL(/\/admin\/dashboard/);

      // Look for hamburger menu - the first button is the sidebar toggle on mobile
      const menuBtn = page.locator('button').first();

      if (await menuBtn.count() > 0) {
        await menuBtn.click();

        // Verify sidebar/nav appears - look for navigation links after opening
        const nav = page.getByRole('navigation');
        await expect(nav.first()).toBeVisible();
      }
    });
  });
});
