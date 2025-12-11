# Admin Setup Security

## Overview

The `/admin/setup` page allows creation of the first administrator account. This document describes the multi-layered security protections in place to prevent unauthorized admin creation.

## Security Layers

### 1. One-Time Setup Protection

**What it does**: Prevents creating additional admin accounts after the first one exists.

**How it works**:
- Server-side check: `isSetupAvailable()` queries the `admin_users` table
- Client-side UI: Displays "Setup Already Complete" if admins exist
- Double-check: Server action re-validates before inserting

**Prevents**:
- Multiple admins being created
- Setup page being used after initial setup

### 2. Setup Key Protection (Production)

**What it does**: Requires a secret key to create the first admin in production.

**How it works**:
- Environment variable: `ADMIN_SETUP_KEY`
- Required in production (`NODE_ENV !== 'development'`)
- Optional in development for easier testing

**Setup instructions**:

```bash
# Generate a secure setup key
openssl rand -base64 32

# Add to production environment variables
ADMIN_SETUP_KEY=your_generated_key_here
```

**Usage**:
1. Set `ADMIN_SETUP_KEY` in your production environment (Vercel, AWS, etc.)
2. Share the key securely with the person creating the first admin
3. They enter it in the "Setup Key" field when creating the account
4. After creating the admin, optionally remove or rotate the key

### 3. Global Disable Switch

**What it does**: Completely disables the setup page.

**How it works**:
- Environment variable: `DISABLE_ADMIN_SETUP=true`
- Overrides all other checks
- Displays "Setup Disabled" message

**When to use**:
- After creating your first admin in production
- To ensure no one can access the setup page
- For compliance requirements

### 4. Race Condition Protection

**What it does**: Prevents simultaneous admin creation attempts.

**How it works**:
- Server action executes all logic server-side
- Database check happens immediately before insert
- Single transaction ensures atomicity

**Prevents**:
- Multiple users creating admins at the same time
- Client-side race conditions

## Configuration Examples

### Development Setup (No Key Required)

```bash
# .env.local
NODE_ENV=development
# No ADMIN_SETUP_KEY needed
# No DISABLE_ADMIN_SETUP needed
```

Behavior: Setup page works without a key, only checks if admins exist.

### Production Setup (Key Required)

```bash
# Vercel Environment Variables
NODE_ENV=production
ADMIN_SETUP_KEY=ABcD1234...your_secure_key
```

Behavior: Setup page requires the setup key + validates no admins exist.

### Production After Initial Setup (Disabled)

```bash
# Vercel Environment Variables
NODE_ENV=production
ADMIN_SETUP_KEY=ABcD1234...your_secure_key
DISABLE_ADMIN_SETUP=true
```

Behavior: Setup page shows "Setup Disabled" message, no admin creation possible.

## Setup Process Flow

### Development

1. Navigate to `/admin/setup`
2. Check: Are there any admins? → If yes, show "Already Complete"
3. If no admins exist, show setup form (no key required)
4. Fill in: Full Name, Email, Password
5. Submit → Server creates admin → Redirect to login

### Production (First Time)

1. Set `ADMIN_SETUP_KEY` in production environment
2. Navigate to `/admin/setup`
3. Check: Are there any admins? → If yes, show "Already Complete"
4. Check: Is setup disabled? → If yes, show "Setup Disabled"
5. If available, show setup form with key field
6. Fill in: Setup Key, Full Name, Email, Password
7. Submit → Server validates key + creates admin → Redirect to login

### Production (After First Admin)

**Option A: Let it auto-block**
- Setup page checks and shows "Already Complete"
- No code changes needed

**Option B: Explicitly disable**
- Set `DISABLE_ADMIN_SETUP=true` in environment
- Setup page shows "Setup Disabled"
- More explicit security posture

## File Reference

| File | Purpose |
|------|---------|
| `/src/app/admin/setup/page.tsx` | Client component for setup UI |
| `/src/app/admin/setup/actions.ts` | Server actions for admin creation |
| `/docs/admin-setup-security.md` | This documentation |

## Security Best Practices

### For Development

✅ **DO:**
- Test the setup flow locally
- Verify "Already Complete" works after creating first admin
- Test with and without setup key

❌ **DON'T:**
- Commit real setup keys to git
- Share development database credentials
- Use production keys in development

### For Production

✅ **DO:**
- Generate a strong setup key (32+ characters)
- Store key in environment variables (Vercel, AWS Secrets Manager, etc.)
- Share key securely (1Password, encrypted email, etc.)
- Consider rotating or removing key after first admin is created
- Set `DISABLE_ADMIN_SETUP=true` after initial setup
- Monitor Supabase logs for unauthorized attempts

❌ **DON'T:**
- Hardcode setup key in source code
- Share setup key in plain text (Slack, email, etc.)
- Reuse setup keys across environments
- Leave setup page enabled indefinitely in production
- Use predictable keys (like "admin123")

## Troubleshooting

### "Setup Already Complete" but no admin exists

**Cause**: Database has a record in `admin_users` but it might be inactive or deleted.

**Fix**:
```sql
-- Check for existing admins
SELECT * FROM admin_users;

-- If you see a deleted/inactive admin, delete it
DELETE FROM admin_users WHERE id = 'uuid-here';

-- Then try setup again
```

### "Invalid setup key" in production

**Cause**: The `ADMIN_SETUP_KEY` environment variable doesn't match the entered key.

**Fix**:
1. Verify the environment variable is set correctly
2. Check for whitespace or encoding issues
3. Regenerate the key if lost
4. Redeploy after changing environment variables

### Setup page shows "Setup Disabled"

**Cause**: `DISABLE_ADMIN_SETUP=true` is set in environment variables.

**Fix**:
1. Remove or set to `false` in environment variables
2. Redeploy the application
3. Try accessing `/admin/setup` again

### "Failed to create admin user" error

**Possible causes**:
- Supabase RLS policies blocking insert
- Missing permissions on `admin_users` table
- Network/connection issues

**Debug steps**:
1. Check browser console and server logs
2. Verify Supabase RLS policies allow public insert on `admin_users` (only for first admin)
3. Check Supabase dashboard for error logs
4. Verify database schema matches expected structure

## Additional Admin Management

### Creating Additional Admins (After First Admin)

**Do NOT use the setup page.** Instead, use the admin dashboard:

1. Log in as existing super admin
2. Navigate to `/admin/users` (or similar admin management page)
3. Create additional admin accounts with appropriate roles

### Deleting an Admin

```sql
-- First, delete from admin_users
DELETE FROM admin_users WHERE user_id = 'auth_user_id_here';

-- Then, delete from auth.users (if needed)
-- This should be done via Supabase Admin API, not direct SQL
```

### Changing Admin Roles

```sql
UPDATE admin_users
SET role = 'admin'  -- or 'super_admin'
WHERE user_id = 'auth_user_id_here';
```

## Compliance & Audit

### Logging

All admin creation attempts are logged:
- Server console logs (`console.error` for failures)
- Supabase audit logs (admin_users table changes)

### Recommendations

For compliance with SOC2, ISO 27001, etc.:

1. **Enable Supabase audit logging**
2. **Set `DISABLE_ADMIN_SETUP=true` immediately after first admin**
3. **Use Supabase RLS policies to restrict admin creation**
4. **Implement 2FA for admin accounts** (Supabase Auth supports this)
5. **Monitor admin login attempts** via Supabase dashboard
6. **Rotate setup key** if ever exposed

## References

- [Supabase RLS Policies](https://supabase.com/docs/guides/auth/row-level-security)
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions)
- [Environment Variables in Vercel](https://vercel.com/docs/concepts/projects/environment-variables)
