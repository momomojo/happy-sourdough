-- Migration: Inventory Management Functions
-- Add functions for inventory tracking, validation, and decrement

-- ============================================
-- INVENTORY DECREMENT FUNCTION
-- ============================================

-- Function to decrement inventory for an order
-- Returns true if successful, false if any item has insufficient stock
CREATE OR REPLACE FUNCTION decrement_inventory_for_order(order_id_param UUID)
RETURNS BOOLEAN AS $$
DECLARE
  item RECORD;
  current_inventory INTEGER;
BEGIN
  -- First, validate all items have sufficient stock
  FOR item IN
    SELECT oi.product_variant_id, oi.quantity, pv.inventory_count, pv.track_inventory, p.name as product_name
    FROM order_items oi
    JOIN product_variants pv ON pv.id = oi.product_variant_id
    JOIN products p ON p.id = pv.product_id
    WHERE oi.order_id = order_id_param
  LOOP
    -- Only check inventory if tracking is enabled
    IF item.track_inventory = true THEN
      IF item.inventory_count IS NULL OR item.inventory_count < item.quantity THEN
        RAISE EXCEPTION 'Insufficient stock for product: %', item.product_name;
      END IF;
    END IF;
  END LOOP;

  -- Now decrement inventory for all items
  FOR item IN
    SELECT oi.product_variant_id, oi.quantity, pv.track_inventory
    FROM order_items oi
    JOIN product_variants pv ON pv.id = oi.product_variant_id
    WHERE oi.order_id = order_id_param
  LOOP
    IF item.track_inventory = true THEN
      UPDATE product_variants
      SET inventory_count = inventory_count - item.quantity
      WHERE id = item.product_variant_id;
    END IF;
  END LOOP;

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- INVENTORY VALIDATION FUNCTION
-- ============================================

-- Function to validate inventory before checkout
-- Returns JSON with validation results
CREATE OR REPLACE FUNCTION validate_inventory(variant_ids UUID[], quantities INTEGER[])
RETURNS JSONB AS $$
DECLARE
  result JSONB := '{"valid": true, "errors": []}'::jsonb;
  i INTEGER;
  variant RECORD;
  errors JSONB := '[]'::jsonb;
BEGIN
  -- Validate arrays have same length
  IF array_length(variant_ids, 1) != array_length(quantities, 1) THEN
    RETURN '{"valid": false, "errors": ["Invalid input: array lengths must match"]}'::jsonb;
  END IF;

  FOR i IN 1..array_length(variant_ids, 1)
  LOOP
    SELECT
      pv.id,
      pv.inventory_count,
      pv.track_inventory,
      pv.is_available,
      p.name as product_name,
      pv.name as variant_name
    INTO variant
    FROM product_variants pv
    JOIN products p ON p.id = pv.product_id
    WHERE pv.id = variant_ids[i];

    IF NOT FOUND THEN
      errors := errors || jsonb_build_object(
        'variant_id', variant_ids[i],
        'error', 'Product variant not found'
      );
      result := jsonb_set(result, '{valid}', 'false'::jsonb);
    ELSIF NOT variant.is_available THEN
      errors := errors || jsonb_build_object(
        'variant_id', variant_ids[i],
        'product_name', variant.product_name,
        'error', 'Product is not available'
      );
      result := jsonb_set(result, '{valid}', 'false'::jsonb);
    ELSIF variant.track_inventory = true AND (variant.inventory_count IS NULL OR variant.inventory_count < quantities[i]) THEN
      errors := errors || jsonb_build_object(
        'variant_id', variant_ids[i],
        'product_name', variant.product_name,
        'variant_name', variant.variant_name,
        'requested', quantities[i],
        'available', COALESCE(variant.inventory_count, 0),
        'error', 'Insufficient stock'
      );
      result := jsonb_set(result, '{valid}', 'false'::jsonb);
    END IF;
  END LOOP;

  result := jsonb_set(result, '{errors}', errors);
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- INVENTORY RESTORE FUNCTION (for cancellations/refunds)
-- ============================================

-- Function to restore inventory when order is cancelled
CREATE OR REPLACE FUNCTION restore_inventory_for_order(order_id_param UUID)
RETURNS BOOLEAN AS $$
DECLARE
  item RECORD;
BEGIN
  FOR item IN
    SELECT oi.product_variant_id, oi.quantity, pv.track_inventory
    FROM order_items oi
    JOIN product_variants pv ON pv.id = oi.product_variant_id
    WHERE oi.order_id = order_id_param
  LOOP
    IF item.track_inventory = true THEN
      UPDATE product_variants
      SET inventory_count = COALESCE(inventory_count, 0) + item.quantity
      WHERE id = item.product_variant_id;
    END IF;
  END LOOP;

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- AUTO-DECREMENT TRIGGER (on order confirmation)
-- ============================================

-- Trigger function to decrement inventory when order is confirmed
CREATE OR REPLACE FUNCTION trigger_decrement_inventory_on_confirmation()
RETURNS TRIGGER AS $$
BEGIN
  -- Only decrement when status changes to 'confirmed' from 'received'
  IF NEW.status = 'confirmed' AND OLD.status = 'received' THEN
    PERFORM decrement_inventory_for_order(NEW.id);
  END IF;

  -- Restore inventory on cancellation/refund
  IF (NEW.status = 'cancelled' OR NEW.status = 'refunded')
     AND OLD.status NOT IN ('cancelled', 'refunded') THEN
    PERFORM restore_inventory_for_order(NEW.id);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS trigger_inventory_on_status_change ON orders;
CREATE TRIGGER trigger_inventory_on_status_change
  AFTER UPDATE OF status ON orders
  FOR EACH ROW
  EXECUTE FUNCTION trigger_decrement_inventory_on_confirmation();

-- ============================================
-- GRANT PERMISSIONS
-- ============================================

-- Grant execute permissions on inventory functions
GRANT EXECUTE ON FUNCTION decrement_inventory_for_order(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION decrement_inventory_for_order(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION validate_inventory(UUID[], INTEGER[]) TO authenticated;
GRANT EXECUTE ON FUNCTION validate_inventory(UUID[], INTEGER[]) TO service_role;
GRANT EXECUTE ON FUNCTION restore_inventory_for_order(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION restore_inventory_for_order(UUID) TO service_role;
