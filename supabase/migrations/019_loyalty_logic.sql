-- Migration: Loyalty Program Logic
-- Description: Functions and triggers for point earning, tier calculation, and redemption.

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to calculate points earned for an order amount based on user tier
CREATE OR REPLACE FUNCTION calculate_loyalty_points_earned(user_id_param UUID, order_total DECIMAL)
RETURNS INTEGER AS $$
DECLARE
  current_tier TEXT;
  multiplier DECIMAL := 1.0;
  points_earned INTEGER;
BEGIN
  -- Get user's current tier
  SELECT tier INTO current_tier
  FROM loyalty_points
  WHERE user_id = user_id_param;

  -- Default to bronze if no record exists
  IF current_tier IS NULL THEN
    current_tier := 'bronze';
  END IF;

  -- Set multiplier based on tier
  CASE current_tier
    WHEN 'silver' THEN multiplier := 1.25;
    WHEN 'gold' THEN multiplier := 1.5;
    ELSE multiplier := 1.0; -- Bronze default
  END CASE;

  -- Calculate points (1 point per $1 * multiplier, rounded down)
  points_earned := FLOOR(order_total * multiplier)::INTEGER;

  RETURN points_earned;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Function to check and update user tier based on lifetime points
CREATE OR REPLACE FUNCTION update_user_tier(user_id_param UUID)
RETURNS VOID AS $$
DECLARE
  current_lifetime_points INTEGER;
  new_tier TEXT;
BEGIN
  -- Get current lifetime points
  SELECT lifetime_points INTO current_lifetime_points
  FROM loyalty_points
  WHERE user_id = user_id_param;

  IF current_lifetime_points IS NULL THEN
    RETURN;
  END IF;

  -- Determine new tier
  IF current_lifetime_points >= 1500 THEN
    new_tier := 'gold';
  ELSIF current_lifetime_points >= 500 THEN
    new_tier := 'silver';
  ELSE
    new_tier := 'bronze';
  END IF;

  -- Update tier
  UPDATE loyalty_points
  SET tier = new_tier
  WHERE user_id = user_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================
-- EARNING TRIGGERS
-- ============================================

-- Function to award points when order is completed
CREATE OR REPLACE FUNCTION award_loyalty_points_on_completion()
RETURNS TRIGGER AS $$
DECLARE
  points_to_award INTEGER;
BEGIN
  -- Only award points if:
  -- 1. Status changed to 'completed', 'picked_up', or 'delivered'
  -- 2. Previous status was NOT one of those (to prevent double counting)
  -- 3. User is registered (user_id is not null)
  IF (NEW.status IN ('completed', 'picked_up', 'delivered')) AND
     (OLD.status NOT IN ('completed', 'picked_up', 'delivered')) AND
     (NEW.user_id IS NOT NULL) THEN

    -- Calculate points based on subtotal (excluding tax/shipping typically, but using total here per request "1 point per $1 spent")
    -- Let's use subtotal to be safe/standard, or total? User said "1 point per $1 spent". Usually implies total.
    -- However, tax/tip usually excluded. Let's start with SUBTOTAL - discount.
    -- Actually, simple approach: Use (total - tax - tip - delivery). basically subtotal - discount.
    -- Let's stick effectively to subtotal - discount for "spend".
    points_to_award := calculate_loyalty_points_earned(NEW.user_id, NEW.subtotal - COALESCE(NEW.discount_amount, 0));

    IF points_to_award > 0 THEN
        -- Insert/Update loyalty_points record
        INSERT INTO loyalty_points (user_id, points, lifetime_points, tier)
        VALUES (NEW.user_id, points_to_award, points_to_award, 'bronze')
        ON CONFLICT (user_id) DO UPDATE
        SET
            points = loyalty_points.points + points_to_award,
            lifetime_points = loyalty_points.lifetime_points + points_to_award;

        -- Record transaction
        INSERT INTO loyalty_transactions (user_id, order_id, points, description)
        VALUES (NEW.user_id, NEW.id, points_to_award, 'Points earned from Order #' || NEW.order_number);

        -- Update Tier
        PERFORM update_user_tier(NEW.user_id);
    END IF;

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger definition
DROP TRIGGER IF EXISTS trigger_award_points ON orders;
CREATE TRIGGER trigger_award_points
  AFTER UPDATE OF status ON orders
  FOR EACH ROW
  EXECUTE FUNCTION award_loyalty_points_on_completion();


-- ============================================
-- REDEMPTION FUNCTION
-- ============================================

-- Function to redeem points for a discount code
CREATE OR REPLACE FUNCTION redeem_loyalty_points(user_id_param UUID, points_to_redeem INTEGER)
RETURNS JSONB AS $$
DECLARE
  user_points INTEGER;
  discount_code_txt TEXT;
  discount_amount DECIMAL;
  reward_identifier TEXT;
BEGIN
  -- 1. Validate Points
  SELECT points INTO user_points
  FROM loyalty_points
  WHERE user_id = user_id_param;

  IF user_points IS NULL OR user_points < points_to_redeem THEN
    RETURN '{"success": false, "error": "Insufficient points"}'::jsonb;
  END IF;

  -- 2. Determine Reward (Logic: 100 points = $5)
  IF points_to_redeem < 100 THEN
     RETURN '{"success": false, "error": "Minimum redemption is 100 points"}'::jsonb;
  END IF;
  
  -- Simple logic: Blocks of 100 only? Or flexible?
  -- User said: "100 points = $5 off". Let's assume strict blocks or just proportional?
  -- Let's implement strict 100 point increments for simplicity and safety,
  -- OR just support the specific "100 points" package requested.
  -- Let's support multiples of 100? No, let's start with single '5 DOLLAR OFF' reward.
  
  IF points_to_redeem != 100 THEN
     RETURN '{"success": false, "error": "Currently only 100 point redemptions are supported"}'::jsonb;
  END IF;

  discount_amount := 5.00;
  reward_identifier := 'REWARD-' || SUBSTRING(gen_random_uuid()::text, 1, 8);
  discount_code_txt := 'LOYALTY-' || SUBSTRING(gen_random_uuid()::text, 1, 6); -- e.g. LOYALTY-A1B2C3

  -- 3. Deduct Points
  UPDATE loyalty_points
  SET points = points - points_to_redeem
  WHERE user_id = user_id_param;

  -- 4. Record Transaction
  INSERT INTO loyalty_transactions (user_id, points, description)
  VALUES (user_id_param, -points_to_redeem, 'Redeemed for $' || discount_amount || ' reward');

  -- 5. Create Discount Code
  INSERT INTO discount_codes (
    code,
    description,
    discount_type,
    discount_value,
    min_order_amount,
    max_uses,
    current_uses,
    is_active
  ) VALUES (
    discount_code_txt,
    '$' || discount_amount || ' Loyalty Reward',
    'fixed',
    discount_amount,
    0, -- No min order? Or maybe min order > discount?
    1, -- Single use
    0,
    true
  );

  RETURN jsonb_build_object(
    'success', true,
    'code', discount_code_txt,
    'amount', discount_amount,
    'remaining_points', user_points - points_to_redeem
  );

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION calculate_loyalty_points_earned(UUID, DECIMAL) TO authenticated;
GRANT EXECUTE ON FUNCTION redeem_loyalty_points(UUID, INTEGER) TO authenticated;
