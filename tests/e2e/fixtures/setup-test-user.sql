-- =====================================================
-- Test User Setup for E2E Tests
-- =====================================================
-- Run this in Supabase SQL Editor to create test users

-- 1. Create Admin User
-- First, create the user via Supabase Auth Dashboard or API
-- Then run this to make them admin:
UPDATE auth.users
SET raw_app_meta_data = jsonb_set(
  COALESCE(raw_app_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE email = 'admin@happysourdough.com';

-- Verify admin user
SELECT
  id,
  email,
  raw_app_meta_data->>'role' as role
FROM auth.users
WHERE email = 'admin@happysourdough.com';

-- 2. Create Customer Profile (if needed)
-- This assumes you have customer_profiles table
INSERT INTO customer_profiles (
  user_id,
  email,
  full_name,
  phone
)
SELECT
  id,
  'admin@happysourdough.com',
  'Admin User',
  '555-0000'
FROM auth.users
WHERE email = 'admin@happysourdough.com'
ON CONFLICT (user_id) DO NOTHING;

-- 3. Optional: Create sample test customer
-- (This would be created via signup flow in tests)

-- =====================================================
-- Cleanup Script (run to reset test data)
-- =====================================================

-- Delete test orders
DELETE FROM order_items
WHERE order_id IN (
  SELECT id FROM orders
  WHERE customer_email LIKE '%@test.com'
  OR customer_email LIKE '%@example.com'
);

DELETE FROM orders
WHERE customer_email LIKE '%@test.com'
OR customer_email LIKE '%@example.com';

-- =====================================================
-- Verification Queries
-- =====================================================

-- Check admin user exists and has role
SELECT
  id,
  email,
  raw_app_meta_data->>'role' as role,
  created_at
FROM auth.users
WHERE email = 'admin@happysourdough.com';

-- Check if products exist for testing
SELECT
  id,
  name,
  category,
  base_price,
  available
FROM products
WHERE available = true
LIMIT 5;

-- Check delivery zones are configured
SELECT
  id,
  zone_number,
  min_order_amount,
  delivery_fee
FROM delivery_zones
ORDER BY zone_number;
