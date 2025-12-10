-- Add discount_code_id foreign key to orders table
-- This migration adds support for storing which discount code was applied to an order

ALTER TABLE orders
ADD COLUMN discount_code_id UUID REFERENCES discount_codes(id) ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX idx_orders_discount_code ON orders(discount_code_id);

-- Add a trigger to increment discount code usage when applied to an order
CREATE OR REPLACE FUNCTION increment_discount_usage()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.discount_code_id IS NOT NULL THEN
    UPDATE discount_codes
    SET current_uses = current_uses + 1
    WHERE id = NEW.discount_code_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_discount_usage
  AFTER INSERT ON orders
  FOR EACH ROW
  WHEN (NEW.discount_code_id IS NOT NULL)
  EXECUTE FUNCTION increment_discount_usage();

-- Add a trigger to decrement discount code usage if order is deleted/cancelled
CREATE OR REPLACE FUNCTION decrement_discount_usage()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.discount_code_id IS NOT NULL THEN
    UPDATE discount_codes
    SET current_uses = GREATEST(0, current_uses - 1)
    WHERE id = OLD.discount_code_id;
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_decrement_discount_usage
  AFTER DELETE ON orders
  FOR EACH ROW
  WHEN (OLD.discount_code_id IS NOT NULL)
  EXECUTE FUNCTION decrement_discount_usage();
