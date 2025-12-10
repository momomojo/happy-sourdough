-- Seed data for discount codes
-- Sample promotional codes for testing the discount system

INSERT INTO discount_codes (
  code,
  description,
  discount_type,
  discount_value,
  min_order_amount,
  max_uses,
  valid_from,
  valid_until,
  is_active
) VALUES
  -- 10% off for new customers, min $25 order, 100 uses max
  (
    'WELCOME10',
    '10% off for new customers',
    'percentage',
    10,
    25,
    100,
    NOW(),
    NOW() + INTERVAL '30 days',
    true
  ),

  -- $5 off any order over $30, 50 uses max
  (
    'FIVE',
    '$5 off any order over $30',
    'fixed',
    5,
    30,
    50,
    NOW(),
    NOW() + INTERVAL '60 days',
    true
  ),

  -- Free delivery on orders over $40, unlimited uses
  (
    'FREEDEL',
    'Free delivery on orders over $40',
    'free_delivery',
    NULL,
    40,
    NULL,
    NOW(),
    NOW() + INTERVAL '90 days',
    true
  ),

  -- 25% off summer special, min $50, limited to 25 uses
  (
    'SUMMER25',
    '25% off summer promotion',
    'percentage',
    25,
    50,
    25,
    NOW(),
    NOW() + INTERVAL '45 days',
    true
  ),

  -- $10 off for orders over $60, limited uses
  (
    'TEN',
    '$10 off orders over $60',
    'fixed',
    10,
    60,
    30,
    NOW(),
    NOW() + INTERVAL '30 days',
    true
  ),

  -- 15% off no minimum, unlimited for testing
  (
    'TEST15',
    '15% off for testing',
    'percentage',
    15,
    NULL,
    NULL,
    NOW(),
    NOW() + INTERVAL '365 days',
    true
  ),

  -- Expired code for testing validation
  (
    'EXPIRED',
    'Expired code for testing',
    'percentage',
    20,
    NULL,
    NULL,
    NOW() - INTERVAL '60 days',
    NOW() - INTERVAL '30 days',
    false
  ),

  -- Future code for testing validation
  (
    'FUTURE',
    'Future code for testing',
    'percentage',
    30,
    NULL,
    NULL,
    NOW() + INTERVAL '7 days',
    NOW() + INTERVAL '37 days',
    true
  ),

  -- Maxed out code for testing (set current_uses manually)
  (
    'MAXEDOUT',
    'Code at max uses for testing',
    'fixed',
    5,
    NULL,
    5,
    NOW(),
    NOW() + INTERVAL '30 days',
    true
  )
ON CONFLICT (code) DO NOTHING;

-- Manually set the MAXEDOUT code to be at max uses
UPDATE discount_codes
SET current_uses = 5
WHERE code = 'MAXEDOUT';
