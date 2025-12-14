import * as Sentry from '@sentry/nextjs';
import { createClient } from './server';
import { redirect } from 'next/navigation';

export type AdminRole = 'super_admin' | 'admin' | 'manager' | 'staff';

export interface User {
  id: string;
  email: string;
  role?: string;
  adminRole?: AdminRole | null;
  user_metadata?: {
    full_name?: string;
    first_name?: string;
    last_name?: string;
  };
}

export interface AdminUser {
  id: string;
  user_id: string;
  email: string;
  role: AdminRole;
  full_name: string | null;
  is_active: boolean;
  created_at: string;
}

/**
 * Get the current authenticated user from Supabase session
 * Returns null if not authenticated
 */
export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email!,
    role: user.app_metadata?.role,
    user_metadata: user.user_metadata,
  };
}

/**
 * Check if the current user has admin role in admin_users table
 */
export async function isAdmin(): Promise<boolean> {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return false;
  }

  // Check admin_users table
  const { data: adminUser, error: adminError } = await supabase
    .from('admin_users')
    .select('role, is_active')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .single();

  if (adminError || !adminUser) {
    return false;
  }

  return true;
}

/**
 * Get admin role for current user
 */
export async function getAdminRole(): Promise<AdminRole | null> {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  const { data: adminUser, error: adminError } = await supabase
    .from('admin_users')
    .select('role')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .single() as { data: { role: AdminRole } | null; error: unknown };

  if (adminError || !adminUser) {
    return null;
  }

  return adminUser.role;
}

/**
 * Get admin user details
 */
export async function getAdminUser(): Promise<AdminUser | null> {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  const { data: adminUser, error: adminError } = await supabase
    .from('admin_users')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .single();

  if (adminError || !adminUser) {
    return null;
  }

  return adminUser as unknown as AdminUser;
}

/**
 * Check if any admin users exist (for first-time setup)
 */
export async function hasAdminUsers(): Promise<boolean> {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from('admin_users')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true);

  if (error) {
    Sentry.captureException(error, {
      tags: { auth_action: 'check_admin_users' },
    });
    console.error('Error checking admin users:', error);
    return true; // Assume admins exist to be safe
  }

  return (count ?? 0) > 0;
}

/**
 * Require admin authentication - redirects to login if not admin
 * Use in Server Components to protect admin routes
 */
export async function requireAdmin(): Promise<User & { adminRole: AdminRole }> {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/admin/login');
  }

  // Check admin_users table
  const { data: adminUser, error: adminError } = await supabase
    .from('admin_users')
    .select('role, is_active')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .single() as { data: { role: AdminRole; is_active: boolean } | null; error: unknown };

  if (adminError || !adminUser) {
    redirect('/'); // Redirect non-admins to homepage
  }

  return {
    id: user.id,
    email: user.email!,
    role: adminUser.role,
    adminRole: adminUser.role,
    user_metadata: user.user_metadata,
  };
}

/**
 * Require specific admin role level
 */
export async function requireAdminRole(
  allowedRoles: AdminRole[]
): Promise<User & { adminRole: AdminRole }> {
  const user = await requireAdmin();

  if (!allowedRoles.includes(user.adminRole)) {
    redirect('/admin/dashboard'); // Redirect to dashboard if insufficient permissions
  }

  return user;
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
}

/**
 * Sign in admin with email and password
 * Returns user on success, null on failure
 */
export async function signInAdmin(
  email: string,
  password: string
): Promise<{ user: (User & { adminRole: AdminRole }) | null; error: string | null }> {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { user: null, error: error.message };
  }

  if (!data.user) {
    return { user: null, error: 'Authentication failed' };
  }

  // Check admin_users table
  const { data: adminUser, error: adminError } = await supabase
    .from('admin_users')
    .select('role, is_active')
    .eq('user_id', data.user.id)
    .eq('is_active', true)
    .single() as { data: { role: AdminRole; is_active: boolean } | null; error: unknown };

  if (adminError || !adminUser) {
    // Sign out non-admin users
    await supabase.auth.signOut();
    Sentry.addBreadcrumb({
      category: 'auth',
      message: 'Non-admin login attempt',
      level: 'warning',
      data: { email },
    });
    return { user: null, error: 'Unauthorized: Admin access required' };
  }

  // Set Sentry user context for better error tracking
  Sentry.setUser({
    id: data.user.id,
    email: data.user.email!,
  });

  Sentry.addBreadcrumb({
    category: 'auth',
    message: 'Admin login successful',
    level: 'info',
    data: { role: adminUser.role },
  });

  return {
    user: {
      id: data.user.id,
      email: data.user.email!,
      adminRole: adminUser.role,
      user_metadata: data.user.user_metadata,
    },
    error: null,
  };
}
