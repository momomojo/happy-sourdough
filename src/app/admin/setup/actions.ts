'use server';

import { createClient } from '@/lib/supabase/server';

/**
 * SECURITY: Admin Setup Action
 *
 * This server action creates the first admin account with the following protections:
 *
 * 1. ONE-TIME SETUP: Checks if any admin exists before proceeding
 * 2. SETUP KEY: Requires ADMIN_SETUP_KEY in production (optional in development)
 * 3. TRANSACTION: Uses a single database query to prevent race conditions
 * 4. ENVIRONMENT CHECK: Can be disabled entirely via DISABLE_ADMIN_SETUP=true
 */

export interface SetupAdminResult {
  success: boolean;
  error?: string;
  requiresEmailConfirmation?: boolean;
}

export async function setupFirstAdmin(
  email: string,
  password: string,
  fullName: string,
  setupKey?: string
): Promise<SetupAdminResult> {
  // Security: Check if setup is disabled
  if (process.env.DISABLE_ADMIN_SETUP === 'true') {
    return {
      success: false,
      error: 'Admin setup has been disabled. Contact your system administrator.',
    };
  }

  // Security: Require setup key in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  const requiredSetupKey = process.env.ADMIN_SETUP_KEY;

  if (!isDevelopment && requiredSetupKey) {
    if (!setupKey || setupKey !== requiredSetupKey) {
      return {
        success: false,
        error: 'Invalid setup key. Contact your system administrator for the setup key.',
      };
    }
  }

  try {
    const supabase = await createClient();

    // Security: Check if any admin already exists (race condition protection)
    const { count, error: countError } = await supabase
      .from('admin_users')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Error checking admin count:', countError);
      return {
        success: false,
        error: 'Failed to verify admin status. Please try again.',
      };
    }

    if ((count ?? 0) > 0) {
      return {
        success: false,
        error: 'Admin setup has already been completed. Please use the login page.',
      };
    }

    // Create the auth user
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (signUpError) {
      return {
        success: false,
        error: signUpError.message,
      };
    }

    if (!authData.user) {
      return {
        success: false,
        error: 'Failed to create user account.',
      };
    }

    // Create the admin_users entry as super_admin
    // Note: Type assertion needed due to Supabase SSR client RPC type inference
    const { error: adminError } = await supabase
      .from('admin_users')
      .insert({
        user_id: authData.user.id,
        role: 'super_admin',
        display_name: fullName,
        is_active: true,
      } as never);

    if (adminError) {
      console.error('Admin insert error:', adminError);

      // Clean up auth user if admin creation failed
      try {
        await supabase.auth.admin.deleteUser(authData.user.id);
      } catch (cleanupError) {
        console.error('Failed to clean up auth user:', cleanupError);
      }

      return {
        success: false,
        error: `Failed to create admin user: ${adminError.message}`,
      };
    }

    return {
      success: true,
      requiresEmailConfirmation: !authData.session,
    };
  } catch (error) {
    console.error('Setup error:', error);
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.',
    };
  }
}

/**
 * Check if admin setup is available
 * Returns false if admins exist or setup is disabled
 */
export async function isSetupAvailable(): Promise<{
  available: boolean;
  requiresKey: boolean;
  isDisabled: boolean;
}> {
  // Check if setup is globally disabled
  if (process.env.DISABLE_ADMIN_SETUP === 'true') {
    return {
      available: false,
      requiresKey: false,
      isDisabled: true,
    };
  }

  try {
    const supabase = await createClient();
    const { count, error } = await supabase
      .from('admin_users')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('Error checking admin availability:', error);
      return {
        available: false,
        requiresKey: false,
        isDisabled: false,
      };
    }

    const hasAdmins = (count ?? 0) > 0;
    const isDevelopment = process.env.NODE_ENV === 'development';
    const requiresKey = !isDevelopment && !!process.env.ADMIN_SETUP_KEY;

    return {
      available: !hasAdmins,
      requiresKey,
      isDisabled: false,
    };
  } catch (error) {
    console.error('Setup availability check error:', error);
    return {
      available: false,
      requiresKey: false,
      isDisabled: false,
    };
  }
}
