# E2E Testing Quick Start Guide

Get up and running with Playwright tests in 5 minutes!

## Prerequisites

1. **Node.js and npm** installed
2. **Database seeded** with sample products
3. **Environment variables** configured in `.env.local`

## Step 1: Create Admin User

Run this SQL in your Supabase SQL Editor:

```sql
-- First create the user via Supabase Dashboard (Authentication > Add User)
-- Email: admin@happysourdough.com
-- Password: admin123
-- Then run this:

UPDATE auth.users
SET raw_app_meta_data = jsonb_set(
  COALESCE(raw_app_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE email = 'admin@happysourdough.com';
```

Alternatively, use the setup script:
```bash
# See tests/e2e/fixtures/setup-test-user.sql
```

## Step 2: Verify Environment

Make sure `.env.local` has these variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Step 3: Start Development Server

```bash
npm run dev
```

Server should start on http://localhost:3000

## Step 4: Run Tests

### Option A: UI Mode (Recommended for First Run)
```bash
npm run test:e2e:ui
```

This opens Playwright's UI where you can:
- See all tests
- Run individual tests
- Watch tests execute in real-time
- Debug failures

### Option B: Headless Mode (CI-style)
```bash
npm run test:e2e
```

### Option C: Headed Mode (See Browser)
```bash
npm run test:e2e:headed
```

### Option D: Debug Mode (Step Through)
```bash
npm run test:e2e:debug
```

## Step 5: View Results

After running tests, view the HTML report:

```bash
npm run test:e2e:report
```

This opens a detailed report with:
- Pass/fail status
- Screenshots of failures
- Execution traces
- Error details

## Test Commands Cheat Sheet

```bash
# Run all tests
npm run test:e2e

# Run with UI (best for development)
npm run test:e2e:ui

# Run in headed mode (see browser)
npm run test:e2e:headed

# Debug tests (step through)
npm run test:e2e:debug

# Run only Chromium tests
npm run test:e2e:chromium

# Run only Firefox tests
npm run test:e2e:firefox

# View test report
npm run test:e2e:report

# Run specific test file
npx playwright test products.spec.ts

# Run specific test by name
npx playwright test -g "should add item to cart"

# Run tests in specific browser
npx playwright test --project=chromium

# Update snapshots (if using visual regression)
npx playwright test --update-snapshots
```

## Common Issues & Solutions

### Issue: Port 3000 already in use
**Solution:**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
# Or use a different port in playwright.config.ts
```

### Issue: Admin login fails
**Solution:**
1. Verify admin user exists in Supabase Auth
2. Check role is set: `raw_app_meta_data->>'role' = 'admin'`
3. Verify credentials match `TEST_USERS.admin` in test-data.ts

### Issue: Tests timeout
**Solution:**
1. Increase timeout in `playwright.config.ts`
2. Check server is running: `curl http://localhost:3000`
3. Check database connection
4. Check Stripe keys are valid

### Issue: Stripe payment form not loading
**Solution:**
1. Verify `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` in `.env.local`
2. Ensure using test mode key: `pk_test_...`
3. Check browser console for errors

### Issue: No products found
**Solution:**
```bash
# Seed database with sample products
# Run your database seed script
```

## Test Data

### Admin Credentials
- Email: `admin@happysourdough.com`
- Password: `admin123`

### Stripe Test Cards
- Success: `4242 4242 4242 4242`
- Requires Auth: `4000 0025 0000 3155`
- Declined: `4000 0000 0000 0002`
- Expiry: Any future date (e.g., `12/34`)
- CVC: Any 3 digits (e.g., `123`)

### Test Addresses
- Zone 1 (Free delivery): 94102
- Zone 2 ($5 delivery): 94103
- Zone 3 ($10 delivery): 94104

## Next Steps

1. **Review test results** in the HTML report
2. **Fix any failing tests** by checking:
   - Database is seeded
   - Admin user exists
   - Environment variables are correct
   - Server is running
3. **Add more tests** as you build new features
4. **Set up CI/CD** using `.github/workflows/e2e-tests.yml`

## Getting Help

- Check `tests/README.md` for detailed documentation
- Review Playwright docs: https://playwright.dev
- Check test fixtures in `tests/e2e/fixtures/test-data.ts`
- Inspect failing test screenshots in `test-results/`

## Pro Tips

1. **Use UI mode** for development - it's amazing for debugging
2. **Use `test.only()`** to run a single test while developing
3. **Use `test.skip()`** to temporarily skip flaky tests
4. **Check the trace viewer** for detailed execution flow
5. **Add `data-testid` attributes** to your components for reliable selectors

## Verification Checklist

Before running tests, verify:

- [ ] Development server is running on port 3000
- [ ] Database has sample products
- [ ] Admin user exists with correct credentials
- [ ] Environment variables are set in `.env.local`
- [ ] Stripe test keys are configured
- [ ] Node modules are installed (`npm install`)
- [ ] Playwright browsers are installed

Run this quick check:
```bash
# Check server
curl http://localhost:3000

# Check environment variables
cat .env.local | grep SUPABASE_URL

# Check if tests can run
npm run test:e2e -- --list
```

## Happy Testing!

You're all set! Run `npm run test:e2e:ui` to get started.
