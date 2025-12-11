-- Migration: Add missing foreign key indexes
-- These indexes improve query performance for JOIN operations and foreign key lookups

-- ============================================
-- MISSING FOREIGN KEY INDEXES
-- ============================================

-- Index for order_items.product_id (FK to products)
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- Index for order_items.product_variant_id (FK to product_variants)
CREATE INDEX IF NOT EXISTS idx_order_items_product_variant_id ON order_items(product_variant_id);

-- Index for orders.time_slot_id (FK to time_slots)
CREATE INDEX IF NOT EXISTS idx_orders_time_slot_id ON orders(time_slot_id);

-- Index for orders.delivery_zone_id (FK to delivery_zones)
CREATE INDEX IF NOT EXISTS idx_orders_delivery_zone_id ON orders(delivery_zone_id);

-- Index for order_status_history.order_id (already exists but ensuring it's there)
CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id ON order_status_history(order_id);

-- Index for customer_addresses.user_id (FK to auth.users)
CREATE INDEX IF NOT EXISTS idx_customer_addresses_user_id ON customer_addresses(user_id);

-- Index for loyalty_points.user_id (FK to auth.users)
CREATE INDEX IF NOT EXISTS idx_loyalty_points_user_id ON loyalty_points(user_id);

-- Index for loyalty_transactions.user_id (FK to auth.users)
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_user_id ON loyalty_transactions(user_id);

-- Index for loyalty_transactions.order_id (FK to orders)
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_order_id ON loyalty_transactions(order_id);

-- Index for product_availability.product_id (FK to products)
CREATE INDEX IF NOT EXISTS idx_product_availability_product_id ON product_availability(product_id);

-- ============================================
-- ADDITIONAL PERFORMANCE INDEXES
-- ============================================

-- Composite index for orders by user and status (common admin query)
CREATE INDEX IF NOT EXISTS idx_orders_user_status ON orders(user_id, status);

-- Composite index for orders by date and status (common production query)
CREATE INDEX IF NOT EXISTS idx_orders_date_status ON orders(delivery_date, status);

-- Index for discount_codes by code (for validation lookups)
CREATE INDEX IF NOT EXISTS idx_discount_codes_code ON discount_codes(code);

-- Index for discount_codes active and valid (for filtering active codes)
CREATE INDEX IF NOT EXISTS idx_discount_codes_active ON discount_codes(is_active) WHERE is_active = true;

-- Index for products by featured status (for homepage queries)
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured) WHERE is_featured = true;

-- Index for time_slots by date and availability (for slot selection)
CREATE INDEX IF NOT EXISTS idx_time_slots_date_available ON time_slots(date, is_available) WHERE is_available = true;
