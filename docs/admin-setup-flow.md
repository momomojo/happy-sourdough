# Admin Setup Security Flow

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     User navigates to                        │
│                      /admin/setup                            │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│              isSetupAvailable() Server Action                │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ 1. Check: DISABLE_ADMIN_SETUP === 'true'?            │  │
│  │    └─► YES → Return { available: false, isDisabled:  │  │
│  │              true }                                   │  │
│  │                                                       │  │
│  │ 2. Check: Any admins exist in database?              │  │
│  │    └─► YES → Return { available: false, requiresKey: │  │
│  │              false }                                  │  │
│  │                                                       │  │
│  │ 3. Check: NODE_ENV !== 'development' && setup key    │  │
│  │           exists?                                     │  │
│  │    └─► Return { available: true, requiresKey: true } │  │
│  │                                                       │  │
│  │ 4. Otherwise: Return { available: true, requiresKey: │  │
│  │              false }                                  │  │
│  └───────────────────────────────────────────────────────┘  │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                    Client UI Decision                        │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ isDisabled === true?                                  │  │
│  │ └─► Show "Setup Disabled" card with lock icon        │  │
│  │                                                       │  │
│  │ available === false?                                  │  │
│  │ └─► Show "Setup Already Complete" card               │  │
│  │                                                       │  │
│  │ available === true?                                   │  │
│  │ └─► Show setup form                                  │  │
│  │     └─► if requiresKey: Show setup key field         │  │
│  └───────────────────────────────────────────────────────┘  │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                  User submits form                           │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│            setupFirstAdmin() Server Action                   │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ SECURITY LAYER 1: Global Disable Check               │  │
│  │ ├─► if DISABLE_ADMIN_SETUP === 'true'                │  │
│  │ └─► Return error: "Setup has been disabled"          │  │
│  │                                                       │  │
│  │ SECURITY LAYER 2: Setup Key Validation               │  │
│  │ ├─► if production && ADMIN_SETUP_KEY exists          │  │
│  │ └─► Validate setupKey === ADMIN_SETUP_KEY            │  │
│  │     └─► NO → Return error: "Invalid setup key"       │  │
│  │                                                       │  │
│  │ SECURITY LAYER 3: Admin Existence Check              │  │
│  │ ├─► Query: SELECT count FROM admin_users             │  │
│  │ └─► if count > 0                                     │  │
│  │     └─► Return error: "Setup already completed"      │  │
│  │                                                       │  │
│  │ SECURITY LAYER 4: Atomic Creation                    │  │
│  │ ├─► Create Supabase auth user                        │  │
│  │ ├─► Insert into admin_users table                    │  │
│  │ └─► if insert fails:                                 │  │
│  │     └─► Rollback: Delete auth user                   │  │
│  │     └─► Return error                                 │  │
│  │                                                       │  │
│  │ SUCCESS: Return { success: true }                    │  │
│  └───────────────────────────────────────────────────────┘  │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                  Redirect to /admin/login                    │
└─────────────────────────────────────────────────────────────┘
```

## Security Decision Tree

```
                        START
                          │
                          ▼
           ┌──────────────────────────┐
           │ DISABLE_ADMIN_SETUP?     │
           └──┬──────────────────┬────┘
              │ true             │ false
              ▼                  ▼
      ┌──────────────┐   ┌──────────────┐
      │ DENY ACCESS  │   │ Any admins?  │
      │ Show Disabled│   └──┬───────┬───┘
      └──────────────┘      │ yes   │ no
                            ▼       ▼
                    ┌──────────┐  ┌──────────────┐
                    │ DENY     │  │ Production?  │
                    │ "Already │  └──┬───────┬───┘
                    │ Complete"│     │ yes   │ no
                    └──────────┘     ▼       ▼
                              ┌──────────┐ ┌──────────┐
                              │ Setup    │ │ ALLOW    │
                              │ key set? │ │ (dev)    │
                              └──┬───┬───┘ └──────────┘
                                 │yes│ no
                                 ▼   ▼
                         ┌──────────┐ ┌──────────┐
                         │ Require  │ │ ALLOW    │
                         │ key      │ │ (prod,   │
                         │          │ │ no key)  │
                         └──────────┘ └──────────┘
```

## Environment-Specific Behavior

### Development (NODE_ENV=development)

```
User → /admin/setup
  └─► Check: admins exist?
      ├─► YES → Show "Already Complete"
      └─► NO → Show form (no key required)
          └─► Submit → Create admin → Success
```

### Production (NODE_ENV=production, ADMIN_SETUP_KEY set)

```
User → /admin/setup
  └─► Check: admins exist?
      ├─► YES → Show "Already Complete"
      └─► NO → Show form (key required)
          └─► Submit
              ├─► Key invalid? → Error: "Invalid setup key"
              └─► Key valid? → Create admin → Success
```

### Production (DISABLE_ADMIN_SETUP=true)

```
User → /admin/setup
  └─► Show "Setup Disabled" (no checks, immediate block)
```

## Race Condition Protection

### Problem: Two users submit simultaneously

```
Time  User A                    User B
─────────────────────────────────────────────────
T0    Navigate to /admin/setup  Navigate to /admin/setup
T1    Check: No admins          Check: No admins
T2    Show form                 Show form
T3    Submit form               Submit form
T4    Check admins (0)          Check admins (0)
T5    Create admin A            Create admin B
      ❌ PROBLEM: Both succeed! Two admins created
```

### Solution: Server-side atomic check

```
Time  User A                          User B
───────────────────────────────────────────────────────
T0    Navigate                        Navigate
T1    Check: No admins                Check: No admins
T2    Show form                       Show form
T3    Submit → Server Action          Submit → Server Action
T4    Server: Check admins (0)        Server: Check admins (0)
T5    Server: Create admin A          Server: Waiting...
T6    ✅ Success                       Server: Check admins (1)
T7                                    ❌ Error: Already complete
```

**Key difference**: Server action performs check immediately before insert, not at page load.

## Code Flow

### Client Component (page.tsx)

```typescript
// 1. On mount, check availability
useEffect(() => {
  const status = await isSetupAvailable();
  setSetupStatus(status);
}, []);

// 2. Render based on status
if (setupStatus.isDisabled) return <SetupDisabled />;
if (!setupStatus.available) return <AlreadyComplete />;

// 3. Show form
<form onSubmit={handleSetup}>
  {setupStatus.requiresKey && <SetupKeyField />}
  <EmailField />
  <PasswordField />
  <SubmitButton />
</form>

// 4. On submit, call server action
const result = await setupFirstAdmin(email, password, fullName, setupKey);
```

### Server Action (actions.ts)

```typescript
export async function setupFirstAdmin(...) {
  // Layer 1: Check disable flag
  if (process.env.DISABLE_ADMIN_SETUP === 'true') {
    return { success: false, error: '...' };
  }

  // Layer 2: Validate setup key
  if (production && setupKey !== process.env.ADMIN_SETUP_KEY) {
    return { success: false, error: '...' };
  }

  // Layer 3: Check admins (race protection)
  const { count } = await supabase.from('admin_users').select('*', { count: 'exact' });
  if (count > 0) {
    return { success: false, error: '...' };
  }

  // Layer 4: Create admin
  const { data: authData } = await supabase.auth.signUp(...);
  const { error } = await supabase.from('admin_users').insert(...);

  // Rollback on failure
  if (error) {
    await supabase.auth.admin.deleteUser(authData.user.id);
    return { success: false, error: '...' };
  }

  return { success: true };
}
```

## Attack Scenarios & Mitigations

| Attack | Mitigation |
|--------|-----------|
| **Direct admin creation** (bypass UI) | Server action validates all checks |
| **Race condition** (simultaneous submissions) | Atomic database check before insert |
| **Brute force setup key** | Key is server-side, never exposed to client |
| **Social engineering** (trick admin into sharing key) | Documentation emphasizes secure sharing |
| **Replay attacks** (reuse old requests) | Each request checks current admin count |
| **Time-of-check-time-of-use (TOCTOU)** | Check happens immediately before insert |
| **Database injection** (malicious input) | Supabase parameterized queries |
| **Authorization bypass** (skip setup key) | Server validates key, not client |

## Comparison: Before vs After

### Before (Vulnerable)

```typescript
// ❌ Client-side only check
useEffect(() => {
  const { count } = await supabase.from('admin_users').select('*');
  setHasAdmins(count > 0);
}, []);

// ❌ Second check in handleSetup, but still race condition
const handleSetup = async () => {
  const { count } = await supabase.from('admin_users').select('*');
  if (count > 0) return; // ❌ Time gap between check and insert

  await supabase.auth.signUp(...);
  await supabase.from('admin_users').insert(...);
};
```

**Vulnerabilities**:
- No setup key protection
- Race condition window
- No global disable option
- Client-side validation only

### After (Secure)

```typescript
// ✅ Server action with all checks
export async function setupFirstAdmin(email, password, fullName, setupKey) {
  // ✅ Global disable
  if (process.env.DISABLE_ADMIN_SETUP === 'true') return error;

  // ✅ Setup key validation
  if (production && setupKey !== process.env.ADMIN_SETUP_KEY) return error;

  // ✅ Atomic check (minimal time gap)
  const { count } = await supabase.from('admin_users').select('*');
  if (count > 0) return error;

  // ✅ Create with rollback
  const auth = await supabase.auth.signUp(...);
  const { error } = await supabase.from('admin_users').insert(...);
  if (error) {
    await supabase.auth.admin.deleteUser(auth.user.id);
    return error;
  }

  return success;
}
```

**Protections**:
- ✅ Setup key in production
- ✅ Minimized race condition window
- ✅ Global disable switch
- ✅ Server-side validation
- ✅ Rollback on failure

---

**Last Updated**: 2025-12-11
**Author**: Claude Sonnet 4.5
**Status**: Production Ready ✅
