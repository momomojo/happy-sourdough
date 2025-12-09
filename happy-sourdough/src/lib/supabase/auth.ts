import { createClient } from './server';
import { redirect } from 'next/navigation';

export interface User {
  id: string;
  email: string;
  role?: string;
  user_metadata?: {
    full_name?: string;
  };
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
 * Check if the current user has admin role
 * Checks both JWT claims and app_metadata
 */
export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser();

  if (!user) {
    return false;
  }

  // Check for admin role in user metadata
  return user.role === 'admin';
}

/**
 * Require admin authentication - redirects to login if not admin
 * Use in Server Components to protect admin routes
 */
export async function requireAdmin(): Promise<User> {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  const adminCheck = await isAdmin();

  if (!adminCheck) {
    redirect('/'); // Redirect non-admins to homepage
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
 * Sign in with email and password
 * Returns user on success, null on failure
 */
export async function signInWithPassword(
  email: string,
  password: string
): Promise<{ user: User | null; error: string | null }> {
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

  // Check if user is admin
  const role = data.user.app_metadata?.role;
  if (role !== 'admin') {
    // Sign out non-admin users
    await supabase.auth.signOut();
    return { user: null, error: 'Unauthorized: Admin access required' };
  }

  return {
    user: {
      id: data.user.id,
      email: data.user.email!,
      role: role,
      user_metadata: data.user.user_metadata,
    },
    error: null,
  };
}
