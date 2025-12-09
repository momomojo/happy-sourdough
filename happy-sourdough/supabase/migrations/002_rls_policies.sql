-- Happy Sourdough Row Level Security Policies

-- ============================================
-- ENABLE RLS ON ALL TABLES
-- ============================================

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE blackout_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE discount_codes ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PRODUCTS (Public read, Admin write)
-- ============================================

CREATE POLICY "Products are viewable by everyone"
  ON products FOR SELECT
  USING (is_available = true);

CREATE POLICY "Admins can manage products"
  ON products FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

-- ============================================
-- PRODUCT VARIANTS (Public read, Admin write)
-- ============================================

CREATE POLICY "Variants are viewable by everyone"
  ON product_variants FOR SELECT
  USING (is_available = true);

CREATE POLICY "Admins can manage variants"
  ON product_variants FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

-- ============================================
-- DELIVERY ZONES (Public read)
-- ============================================

CREATE POLICY "Delivery zones are viewable by everyone"
  ON delivery_zones FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage zones"
  ON delivery_zones FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

-- ============================================
-- TIME SLOTS (Public read available)
-- ============================================

CREATE POLICY "Available time slots are viewable"
  ON time_slots FOR SELECT
  USING (
    is_available = true
    AND date >= CURRENT_DATE
    AND current_orders < max_orders
  );

CREATE POLICY "Admins can manage time slots"
  ON time_slots FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

-- ============================================
-- ORDERS (User owns, Admin all)
-- ============================================

CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  USING (
    auth.uid() = user_id
    OR auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY "Anyone can create orders"
  ON orders FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update own pending orders"
  ON orders FOR UPDATE
  USING (
    (auth.uid() = user_id AND status = 'received')
    OR auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY "Admins can delete orders"
  ON orders FOR DELETE
  USING (auth.jwt() ->> 'role' = 'admin');

-- ============================================
-- ORDER ITEMS (Same as orders)
-- ============================================

CREATE POLICY "Users can view own order items"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND (orders.user_id = auth.uid() OR auth.jwt() ->> 'role' = 'admin')
    )
  );

CREATE POLICY "Anyone can create order items"
  ON order_items FOR INSERT
  WITH CHECK (true);

-- ============================================
-- CUSTOMER PROFILES (User owns)
-- ============================================

CREATE POLICY "Users can view own profile"
  ON customer_profiles FOR SELECT
  USING (auth.uid() = id OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Users can update own profile"
  ON customer_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON customer_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================
-- CUSTOMER ADDRESSES (User owns)
-- ============================================

CREATE POLICY "Users can manage own addresses"
  ON customer_addresses FOR ALL
  USING (auth.uid() = user_id);

-- ============================================
-- LOYALTY (User owns)
-- ============================================

CREATE POLICY "Users can view own loyalty points"
  ON loyalty_points FOR SELECT
  USING (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Users can view own loyalty transactions"
  ON loyalty_transactions FOR SELECT
  USING (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can manage loyalty"
  ON loyalty_points FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can manage loyalty transactions"
  ON loyalty_transactions FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

-- ============================================
-- DISCOUNT CODES (Public validate, Admin manage)
-- ============================================

CREATE POLICY "Anyone can view active discount codes"
  ON discount_codes FOR SELECT
  USING (
    is_active = true
    AND (valid_from IS NULL OR valid_from <= NOW())
    AND (valid_until IS NULL OR valid_until >= NOW())
  );

CREATE POLICY "Admins can manage discount codes"
  ON discount_codes FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (auth.jwt() ->> 'role' = 'admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_service_role()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (auth.jwt() ->> 'role' = 'service_role');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
