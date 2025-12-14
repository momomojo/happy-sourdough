-- Migration: Create Pickup Locations Table
-- Description: Adds table for managing multiple pickup locations dynamically.

-- ============================================
-- PICKUP LOCATIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS pickup_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip TEXT NOT NULL,
  instructions TEXT, -- Specific pickup instructions for this location
  operating_hours JSONB, -- Optional override of global hours
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- RLS POLICIES
-- ============================================

ALTER TABLE pickup_locations ENABLE ROW LEVEL SECURITY;

-- Public read access (anyone can see where to pick up)
CREATE POLICY "Anyone can view active pickup locations"
  ON pickup_locations
  FOR SELECT
  USING (is_active = true);

-- Admins can view all (including inactive)
CREATE POLICY "Admins can view all pickup locations"
  ON pickup_locations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid()
      AND is_active = true
    )
  );

-- Only admins can modify
CREATE POLICY "Only admins can modify pickup locations"
  ON pickup_locations
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid()
      AND is_active = true
    )
  );

-- ============================================
-- TRIGGERS
-- ============================================

-- Update updated_at timestamp
CREATE TRIGGER trigger_pickup_locations_updated
  BEFORE UPDATE ON pickup_locations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================
-- SEED DATA
-- ============================================

-- Seed the main bakery location as the first pickup location
INSERT INTO pickup_locations (name, address, city, state, zip, instructions, is_active)
VALUES (
  'Main Bakery',
  '123 Bakery Lane',
  'San Francisco',
  'CA',
  '94102',
  'Enter through the main entrance. Pickup counter is on the left.',
  true
);
