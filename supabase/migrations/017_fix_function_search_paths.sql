-- Migration: Fix function search_path security warnings
-- Sets search_path = '' for all functions to prevent search_path injection attacks
-- Per Supabase security advisory: https://supabase.com/docs/guides/database/database-advisors?lint=0011_function_search_path_mutable

-- ============================================
-- TRIGGER FUNCTIONS (used by database triggers)
-- ============================================

-- Fix decrement_discount_usage trigger function
CREATE OR REPLACE FUNCTION public.decrement_discount_usage()
  RETURNS trigger
  LANGUAGE plpgsql
  SET search_path = ''
AS $function$
BEGIN
  IF OLD.discount_code_id IS NOT NULL THEN
    UPDATE public.discount_codes
    SET current_uses = GREATEST(0, current_uses - 1)
    WHERE id = OLD.discount_code_id;
  END IF;
  RETURN OLD;
END;
$function$;

-- Fix increment_discount_usage trigger function (trigger version, not RPC)
-- Note: There's also an RPC version with parameter that already has search_path set
CREATE OR REPLACE FUNCTION public.increment_discount_usage()
  RETURNS trigger
  LANGUAGE plpgsql
  SET search_path = ''
AS $function$
BEGIN
  IF NEW.discount_code_id IS NOT NULL THEN
    UPDATE public.discount_codes
    SET current_uses = current_uses + 1
    WHERE id = NEW.discount_code_id;
  END IF;
  RETURN NEW;
END;
$function$;

-- Fix increment_slot_orders trigger function (trigger version, not RPC)
-- Note: There's also an RPC version with parameter that already has search_path set
CREATE OR REPLACE FUNCTION public.increment_slot_orders()
  RETURNS trigger
  LANGUAGE plpgsql
  SET search_path = ''
AS $function$
BEGIN
  UPDATE public.time_slots
  SET current_orders = current_orders + 1
  WHERE id = NEW.time_slot_id;
  RETURN NEW;
END;
$function$;

-- Fix trigger_decrement_inventory_on_confirmation
CREATE OR REPLACE FUNCTION public.trigger_decrement_inventory_on_confirmation()
  RETURNS trigger
  LANGUAGE plpgsql
  SET search_path = ''
AS $function$
BEGIN
  IF NEW.status = 'confirmed' AND OLD.status = 'received' THEN
    PERFORM public.decrement_inventory_for_order(NEW.id);
  END IF;

  IF (NEW.status = 'cancelled' OR NEW.status = 'refunded')
     AND OLD.status NOT IN ('cancelled', 'refunded') THEN
    PERFORM public.restore_inventory_for_order(NEW.id);
  END IF;

  RETURN NEW;
END;
$function$;

-- ============================================
-- SECURITY DEFINER FUNCTIONS (CRITICAL TO FIX)
-- These run with elevated privileges, so search_path is security-critical
-- ============================================

-- Fix decrement_inventory_for_order (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.decrement_inventory_for_order(order_id_param uuid)
  RETURNS boolean
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = ''
AS $function$
DECLARE
  item RECORD;
  current_inventory INTEGER;
BEGIN
  -- First, validate all items have sufficient stock
  FOR item IN
    SELECT oi.product_variant_id, oi.quantity, pv.inventory_count, pv.track_inventory, p.name as product_name
    FROM public.order_items oi
    JOIN public.product_variants pv ON pv.id = oi.product_variant_id
    JOIN public.products p ON p.id = pv.product_id
    WHERE oi.order_id = order_id_param
  LOOP
    IF item.track_inventory = true THEN
      IF item.inventory_count IS NULL OR item.inventory_count < item.quantity THEN
        RAISE EXCEPTION 'Insufficient stock for product: %', item.product_name;
      END IF;
    END IF;
  END LOOP;

  -- Now decrement inventory for all items
  FOR item IN
    SELECT oi.product_variant_id, oi.quantity, pv.track_inventory
    FROM public.order_items oi
    JOIN public.product_variants pv ON pv.id = oi.product_variant_id
    WHERE oi.order_id = order_id_param
  LOOP
    IF item.track_inventory = true THEN
      UPDATE public.product_variants
      SET inventory_count = inventory_count - item.quantity
      WHERE id = item.product_variant_id;
    END IF;
  END LOOP;

  RETURN true;
END;
$function$;

-- Fix validate_inventory (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.validate_inventory(variant_ids uuid[], quantities integer[])
  RETURNS jsonb
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = ''
AS $function$
DECLARE
  result JSONB := '{"valid": true, "errors": []}'::jsonb;
  i INTEGER;
  variant RECORD;
  errors JSONB := '[]'::jsonb;
BEGIN
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
    FROM public.product_variants pv
    JOIN public.products p ON p.id = pv.product_id
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
$function$;

-- Fix restore_inventory_for_order (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.restore_inventory_for_order(order_id_param uuid)
  RETURNS boolean
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = ''
AS $function$
DECLARE
  item RECORD;
BEGIN
  FOR item IN
    SELECT oi.product_variant_id, oi.quantity, pv.track_inventory
    FROM public.order_items oi
    JOIN public.product_variants pv ON pv.id = oi.product_variant_id
    WHERE oi.order_id = order_id_param
  LOOP
    IF item.track_inventory = true THEN
      UPDATE public.product_variants
      SET inventory_count = COALESCE(inventory_count, 0) + item.quantity
      WHERE id = item.product_variant_id;
    END IF;
  END LOOP;

  RETURN true;
END;
$function$;
