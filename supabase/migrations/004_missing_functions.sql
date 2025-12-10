-- Migration 004: Add missing database functions and columns
-- This fixes issues found during codebase review

-- ============================================
-- MISSING RPC FUNCTION: decrement_slot_orders
-- Called when orders are cancelled to release time slots
-- ============================================

CREATE OR REPLACE FUNCTION decrement_slot_orders(slot_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE time_slots
  SET current_orders = GREATEST(0, current_orders - 1)
  WHERE id = slot_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- MISSING RPC FUNCTION: increment_slot_orders (parameterized version)
-- The trigger version exists, but we need a callable RPC version
-- ============================================

CREATE OR REPLACE FUNCTION increment_slot_orders(slot_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE time_slots
  SET current_orders = current_orders + 1
  WHERE id = slot_id
    AND current_orders < max_orders;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Add stripe_checkout_session_id to orders if missing
-- (Safe to run - uses IF NOT EXISTS pattern)
-- ============================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders'
    AND column_name = 'stripe_checkout_session_id'
  ) THEN
    ALTER TABLE orders ADD COLUMN stripe_checkout_session_id TEXT;
    CREATE INDEX idx_orders_stripe_session ON orders(stripe_checkout_session_id);
  END IF;
END $$;

-- ============================================
-- Grant execute permissions on RPC functions
-- ============================================

GRANT EXECUTE ON FUNCTION decrement_slot_orders(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION decrement_slot_orders(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION increment_slot_orders(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_slot_orders(UUID) TO service_role;
