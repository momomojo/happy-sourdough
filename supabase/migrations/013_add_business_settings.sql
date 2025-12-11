-- Add business_settings table and helper functions
-- This migration adds configurable business settings including tax rates

-- ============================================
-- BUSINESS SETTINGS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS business_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add index for faster key lookups
CREATE INDEX IF NOT EXISTS idx_business_settings_key ON business_settings(key);

-- Add update trigger
CREATE TRIGGER trigger_business_settings_updated
  BEFORE UPDATE ON business_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to get a business setting value
CREATE OR REPLACE FUNCTION get_business_setting(setting_key TEXT)
RETURNS JSONB AS $$
DECLARE
  setting_value JSONB;
BEGIN
  SELECT value INTO setting_value
  FROM business_settings
  WHERE key = setting_key;

  RETURN setting_value;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update a business setting
CREATE OR REPLACE FUNCTION update_business_setting(setting_key TEXT, new_value JSONB)
RETURNS BOOLEAN AS $$
BEGIN
  INSERT INTO business_settings (key, value)
  VALUES (setting_key, new_value)
  ON CONFLICT (key)
  DO UPDATE SET value = new_value, updated_at = NOW();

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- SEED DEFAULT SETTINGS
-- ============================================

-- Insert default tax settings (8% California sales tax)
INSERT INTO business_settings (key, value, description)
VALUES (
  'tax_settings',
  '{"type": "flat", "rate": 0.08, "name": "Sales Tax", "zones": []}'::jsonb,
  'Tax calculation configuration'
)
ON CONFLICT (key) DO NOTHING;

-- Insert default business information
INSERT INTO business_settings (key, value, description)
VALUES
  (
    'business_name',
    '"Happy Sourdough"'::jsonb,
    'Business name'
  ),
  (
    'business_phone',
    '"+1 (555) 123-4567"'::jsonb,
    'Business phone number'
  ),
  (
    'business_email',
    '"hello@happysourdough.com"'::jsonb,
    'Business email'
  ),
  (
    'business_address',
    '"123 Bakery Lane, San Francisco, CA 94102"'::jsonb,
    'Business address'
  )
ON CONFLICT (key) DO NOTHING;

-- Insert default operating hours
INSERT INTO business_settings (key, value, description)
VALUES (
  'operating_hours',
  '{
    "monday": {"open": "07:00", "close": "19:00", "closed": false},
    "tuesday": {"open": "07:00", "close": "19:00", "closed": false},
    "wednesday": {"open": "07:00", "close": "19:00", "closed": false},
    "thursday": {"open": "07:00", "close": "19:00", "closed": false},
    "friday": {"open": "07:00", "close": "19:00", "closed": false},
    "saturday": {"open": "08:00", "close": "17:00", "closed": false},
    "sunday": {"open": "08:00", "close": "14:00", "closed": false}
  }'::jsonb,
  'Operating hours by day of week'
)
ON CONFLICT (key) DO NOTHING;

-- Insert default slot settings
INSERT INTO business_settings (key, value, description)
VALUES (
  'slot_settings',
  '{"slot_duration_minutes": 120, "max_orders_per_slot": 10, "advance_booking_days": 14}'::jsonb,
  'Time slot configuration'
)
ON CONFLICT (key) DO NOTHING;

-- Insert default delivery settings
INSERT INTO business_settings (key, value, description)
VALUES (
  'delivery_settings',
  '{"enabled": true, "cutoff_hours": 24}'::jsonb,
  'Delivery configuration'
)
ON CONFLICT (key) DO NOTHING;

-- Insert default pickup settings
INSERT INTO business_settings (key, value, description)
VALUES (
  'pickup_settings',
  '{"enabled": true, "cutoff_hours": 2, "location_notes": "Enter through the main entrance on Bakery Lane"}'::jsonb,
  'Pickup configuration'
)
ON CONFLICT (key) DO NOTHING;

-- Insert default order settings
INSERT INTO business_settings (key, value, description)
VALUES (
  'order_settings',
  '{"allow_guest_checkout": true, "require_phone": true, "default_instructions": ""}'::jsonb,
  'Order checkout configuration'
)
ON CONFLICT (key) DO NOTHING;

-- Insert default notification settings
INSERT INTO business_settings (key, value, description)
VALUES (
  'notification_settings',
  '{"email_order_confirmation": true, "email_status_updates": true, "email_delivery_reminders": true}'::jsonb,
  'Email notification configuration'
)
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- RLS POLICIES
-- ============================================

-- Enable RLS
ALTER TABLE business_settings ENABLE ROW LEVEL SECURITY;

-- Public read access (tax rates are not sensitive)
CREATE POLICY "Anyone can view business settings"
  ON business_settings
  FOR SELECT
  USING (true);

-- Only admins can modify settings
CREATE POLICY "Only admins can modify business settings"
  ON business_settings
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid()
      AND is_active = true
    )
  );
