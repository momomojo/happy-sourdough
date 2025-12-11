-- Add RPC function to atomically increment discount code usage
-- This prevents race conditions when multiple orders use the same discount code simultaneously

CREATE OR REPLACE FUNCTION increment_discount_usage(discount_code_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE discount_codes
  SET current_uses = current_uses + 1
  WHERE id = discount_code_id;
END;
$$;

-- Grant execute permission to authenticated and service role
GRANT EXECUTE ON FUNCTION increment_discount_usage(uuid) TO authenticated, service_role;
