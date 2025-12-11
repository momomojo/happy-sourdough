-- Migration: Create admin_users table
-- This table is required for admin authentication and role management

-- ============================================
-- ADMIN USERS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'staff' CHECK (role IN ('super_admin', 'admin', 'manager', 'staff')),
  display_name TEXT,
  is_active BOOLEAN DEFAULT true,
  permissions JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON admin_users(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON admin_users(role);
CREATE INDEX IF NOT EXISTS idx_admin_users_active ON admin_users(is_active);

-- Add update trigger for updated_at
CREATE TRIGGER trigger_admin_users_updated
  BEFORE UPDATE ON admin_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to check if current user is an admin
CREATE OR REPLACE FUNCTION is_admin(check_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
DECLARE
  admin_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM admin_users
    WHERE user_id = check_user_id
    AND is_active = true
  ) INTO admin_exists;

  RETURN admin_exists;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get admin role for a user
CREATE OR REPLACE FUNCTION get_admin_role(check_user_id UUID DEFAULT auth.uid())
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM admin_users
  WHERE user_id = check_user_id
  AND is_active = true;

  RETURN user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- RLS POLICIES
-- ============================================

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Super admins can see all admin users
CREATE POLICY "Super admins can view all admin users"
  ON admin_users
  FOR SELECT
  USING (
    get_admin_role(auth.uid()) = 'super_admin'
    OR user_id = auth.uid()
  );

-- Only super admins can create/update/delete admin users
CREATE POLICY "Super admins can manage admin users"
  ON admin_users
  FOR ALL
  USING (
    get_admin_role(auth.uid()) = 'super_admin'
  );

-- Allow insert during initial setup (when no admins exist)
CREATE POLICY "Allow initial admin creation"
  ON admin_users
  FOR INSERT
  WITH CHECK (
    NOT EXISTS (SELECT 1 FROM admin_users WHERE is_active = true)
  );

-- Users can view their own admin record
CREATE POLICY "Users can view own admin record"
  ON admin_users
  FOR SELECT
  USING (user_id = auth.uid());
