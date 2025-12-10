-- Happy Sourdough Seed Data

-- ============================================
-- DELIVERY ZONES
-- ============================================

INSERT INTO delivery_zones (name, description, zip_codes, min_order, delivery_fee, free_delivery_threshold, estimated_time_minutes, sort_order) VALUES
('Zone 1', '0-3 miles from bakery', ARRAY['90210', '90211', '90212'], 25.00, 0.00, NULL, 30, 1),
('Zone 2', '3-7 miles from bakery', ARRAY['90213', '90214', '90215', '90216'], 40.00, 5.00, 75.00, 45, 2),
('Zone 3', '7-12 miles from bakery', ARRAY['90217', '90218', '90219', '90220', '90221'], 60.00, 10.00, 100.00, 60, 3);

-- ============================================
-- PRODUCTS
-- ============================================

-- Breads
INSERT INTO products (name, slug, description, short_description, base_price, category, lead_time_hours, allergens, dietary_info, is_featured, image_url) VALUES
('Classic Sourdough Loaf', 'classic-sourdough-loaf', 'Our signature sourdough, crafted with a 10-year-old starter. Crispy crust, tangy flavor, and perfect crumb structure.', 'Our signature 10-year starter sourdough', 8.50, 'bread', 24, ARRAY['wheat'], ARRAY['vegan'], true, '/images/products/classic-sourdough.jpg'),
('Whole Wheat Sourdough', 'whole-wheat-sourdough', 'Hearty whole wheat sourdough with a nutty flavor and dense, satisfying texture.', 'Hearty whole wheat with nutty flavor', 9.00, 'bread', 24, ARRAY['wheat'], ARRAY['vegan'], false, '/images/products/whole-wheat-sourdough.jpg'),
('Olive Rosemary Sourdough', 'olive-rosemary-sourdough', 'Mediterranean-inspired sourdough studded with kalamata olives and fresh rosemary.', 'Mediterranean olives and fresh rosemary', 11.00, 'bread', 24, ARRAY['wheat'], ARRAY['vegan'], true, '/images/products/olive-rosemary.jpg'),
('Cinnamon Raisin Sourdough', 'cinnamon-raisin-sourdough', 'Sweet and aromatic sourdough swirled with cinnamon and plump raisins. Perfect for breakfast toast.', 'Sweet cinnamon swirl with raisins', 10.50, 'bread', 24, ARRAY['wheat'], ARRAY['vegan'], false, '/images/products/cinnamon-raisin.jpg'),
('Jalapeño Cheddar Sourdough', 'jalapeno-cheddar-sourdough', 'Spicy jalapeños and sharp cheddar cheese folded into our classic sourdough.', 'Spicy jalapeños with sharp cheddar', 12.00, 'bread', 24, ARRAY['wheat', 'dairy'], ARRAY[]::TEXT[], false, '/images/products/jalapeno-cheddar.jpg');

-- Pastries
INSERT INTO products (name, slug, description, short_description, base_price, category, lead_time_hours, allergens, dietary_info, is_featured, image_url) VALUES
('Sourdough Croissant', 'sourdough-croissant', 'Flaky, buttery croissant made with sourdough for extra depth of flavor. 72-hour fermentation process.', 'Flaky butter croissant with sourdough tang', 4.50, 'pastry', 24, ARRAY['wheat', 'dairy', 'eggs'], ARRAY[]::TEXT[], true, '/images/products/croissant.jpg'),
('Pain au Chocolat', 'pain-au-chocolat', 'Chocolate-filled croissant with premium dark chocolate batons.', 'Dark chocolate filled croissant', 5.00, 'pastry', 24, ARRAY['wheat', 'dairy', 'eggs'], ARRAY[]::TEXT[], false, '/images/products/pain-au-chocolat.jpg'),
('Almond Croissant', 'almond-croissant', 'Twice-baked croissant filled with almond cream and topped with sliced almonds.', 'Almond cream filled, twice-baked', 5.50, 'pastry', 24, ARRAY['wheat', 'dairy', 'eggs', 'nuts'], ARRAY[]::TEXT[], false, '/images/products/almond-croissant.jpg'),
('Sourdough Cinnamon Roll', 'sourdough-cinnamon-roll', 'Pillowy sourdough roll with cinnamon sugar swirl and cream cheese frosting.', 'Cinnamon swirl with cream cheese frosting', 5.00, 'pastry', 24, ARRAY['wheat', 'dairy', 'eggs'], ARRAY[]::TEXT[], true, '/images/products/cinnamon-roll.jpg');

-- Cakes
INSERT INTO products (name, slug, description, short_description, base_price, category, lead_time_hours, allergens, dietary_info, is_featured, image_url) VALUES
('Sourdough Birthday Cake', 'sourdough-birthday-cake', 'Unique birthday cake featuring sourdough-based layers with your choice of frosting. Custom decorations available.', 'Custom birthday cake with sourdough layers', 45.00, 'cake', 72, ARRAY['wheat', 'dairy', 'eggs'], ARRAY[]::TEXT[], true, '/images/products/birthday-cake.jpg'),
('Chocolate Sourdough Cake', 'chocolate-sourdough-cake', 'Rich chocolate cake with sourdough complexity. Finished with chocolate ganache.', 'Rich chocolate with sourdough complexity', 55.00, 'cake', 72, ARRAY['wheat', 'dairy', 'eggs'], ARRAY[]::TEXT[], false, '/images/products/chocolate-cake.jpg');

-- Cookies
INSERT INTO products (name, slug, description, short_description, base_price, category, lead_time_hours, allergens, dietary_info, is_featured, image_url) VALUES
('Sourdough Chocolate Chip Cookie', 'sourdough-chocolate-chip', 'Chewy sourdough discard cookies with premium chocolate chips. Sold by the half dozen.', 'Chewy cookies with premium chocolate', 8.00, 'cookie', 24, ARRAY['wheat', 'dairy', 'eggs'], ARRAY[]::TEXT[], false, '/images/products/chocolate-chip-cookies.jpg'),
('Sourdough Snickerdoodle', 'sourdough-snickerdoodle', 'Classic snickerdoodles with a sourdough twist. Sold by the half dozen.', 'Classic cinnamon sugar with sourdough', 7.50, 'cookie', 24, ARRAY['wheat', 'dairy', 'eggs'], ARRAY[]::TEXT[], false, '/images/products/snickerdoodles.jpg');

-- ============================================
-- PRODUCT VARIANTS
-- ============================================

INSERT INTO product_variants (product_id, name, price_adjustment, is_default, sort_order)
SELECT id, 'Regular (1.5 lb)', 0, true, 1 FROM products WHERE slug = 'classic-sourdough-loaf';
INSERT INTO product_variants (product_id, name, price_adjustment, sort_order)
SELECT id, 'Large (2.5 lb)', 4.00, 2 FROM products WHERE slug = 'classic-sourdough-loaf';

INSERT INTO product_variants (product_id, name, description, price_adjustment, is_default, sort_order)
SELECT id, '6-inch', 'Serves 8-10', 0, true, 1 FROM products WHERE slug = 'sourdough-birthday-cake';
INSERT INTO product_variants (product_id, name, description, price_adjustment, sort_order)
SELECT id, '8-inch', 'Serves 12-16', 20.00, 2 FROM products WHERE slug = 'sourdough-birthday-cake';
INSERT INTO product_variants (product_id, name, description, price_adjustment, sort_order)
SELECT id, '10-inch', 'Serves 20-24', 40.00, 3 FROM products WHERE slug = 'sourdough-birthday-cake';

INSERT INTO product_variants (product_id, name, price_adjustment, is_default, sort_order)
SELECT id, 'Plain', 0, true, 1 FROM products WHERE slug = 'sourdough-croissant';
INSERT INTO product_variants (product_id, name, price_adjustment, sort_order)
SELECT id, 'Ham & Cheese', 2.50, 2 FROM products WHERE slug = 'sourdough-croissant';
INSERT INTO product_variants (product_id, name, price_adjustment, sort_order)
SELECT id, 'Everything Seasoning', 0.50, 3 FROM products WHERE slug = 'sourdough-croissant';

-- ============================================
-- TIME SLOTS (Next 14 days)
-- ============================================

DO $$
DECLARE
  slot_date DATE;
  day_counter INTEGER;
BEGIN
  FOR day_counter IN 0..13 LOOP
    slot_date := CURRENT_DATE + day_counter;

    INSERT INTO time_slots (date, window_start, window_end, slot_type, max_orders)
    VALUES (slot_date, '08:00', '10:00', 'pickup', 15);

    INSERT INTO time_slots (date, window_start, window_end, slot_type, max_orders)
    VALUES (slot_date, '10:00', '12:00', 'both', 12);

    INSERT INTO time_slots (date, window_start, window_end, slot_type, max_orders)
    VALUES (slot_date, '14:00', '16:00', 'both', 12);

    INSERT INTO time_slots (date, window_start, window_end, slot_type, max_orders)
    VALUES (slot_date, '16:00', '18:00', 'delivery', 10);
  END LOOP;
END $$;

-- ============================================
-- BLACKOUT DATES
-- ============================================

INSERT INTO blackout_dates (date, reason) VALUES
('2025-12-25', 'Christmas Day - Closed'),
('2025-12-26', 'Day after Christmas - Closed'),
('2026-01-01', 'New Year''s Day - Closed'),
('2026-07-04', 'Independence Day - Closed');

-- ============================================
-- DISCOUNT CODES
-- ============================================

INSERT INTO discount_codes (code, description, discount_type, discount_value, min_order_amount, valid_until, is_active) VALUES
('WELCOME10', 'Welcome discount for new customers', 'percentage', 10, 25.00, '2026-12-31 23:59:59', true),
('FREEDELIVERY', 'Free delivery on orders over $50', 'free_delivery', NULL, 50.00, '2026-06-30 23:59:59', true),
('SUMMER5', 'Summer special - $5 off', 'fixed', 5, 30.00, '2026-08-31 23:59:59', true);
