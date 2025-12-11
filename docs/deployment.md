# Deployment Guide

## Overview

Happy Sourdough uses a continuous deployment pipeline:
- **Vercel**: Automatic deployments on push to `main` branch
- **GitHub Actions**: Code quality checks, build verification, and E2E tests

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  GitHub Push    │────▶│  GitHub Actions  │────▶│  Vercel Deploy  │
│  (main branch)  │     │  (CI Pipeline)   │     │  (Production)   │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                               │
                               ▼
                        ┌──────────────────┐
                        │  Quality Gates   │
                        │  - Type Check    │
                        │  - Lint          │
                        │  - Build         │
                        │  - E2E Tests*    │
                        └──────────────────┘
                        * E2E tests run on PRs only
```

## Required GitHub Secrets

Configure these secrets in your GitHub repository settings:
**Settings → Secrets and variables → Actions → New repository secret**

### Required Secrets

| Secret Name | Description | Where to Find |
|-------------|-------------|---------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Supabase Dashboard → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Supabase Dashboard → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (for E2E tests) | Supabase Dashboard → Project Settings → API |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | Stripe Dashboard → Developers → API keys |
| `STRIPE_SECRET_KEY` | Stripe secret key (for E2E tests) | Stripe Dashboard → Developers → API keys |

### Optional Secrets (for Sentry source maps)

| Secret Name | Description | Where to Find |
|-------------|-------------|---------------|
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry DSN for error tracking | Sentry → Project Settings → Client Keys |
| `SENTRY_AUTH_TOKEN` | Sentry auth token for source map upload | Sentry → Settings → Auth Tokens |

## Required Vercel Environment Variables

These should be configured in the Vercel Dashboard:
**Project → Settings → Environment Variables**

### Production Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key (use live keys for production) |
| `STRIPE_SECRET_KEY` | Stripe secret key (use live keys for production) |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `NEXT_PUBLIC_APP_URL` | Production URL (e.g., `https://happy-sourdough.vercel.app`) |
| `RESEND_API_KEY` | Resend API key for transactional emails |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry DSN for error tracking |
| `ADMIN_SETUP_KEY` | Secret key for first admin creation |
| `DISABLE_ADMIN_SETUP` | Set to `true` after creating first admin |

## CI/CD Pipeline

### Workflow: `.github/workflows/ci.yml`

The CI pipeline runs on:
- **Push to main**: Quality checks + Build verification
- **Pull requests to main**: Quality checks + Build + E2E tests

#### Jobs

1. **Quality** (runs first)
   - TypeScript type checking (`tsc --noEmit`)
   - ESLint linting (`npm run lint`)

2. **Build** (runs after Quality passes)
   - Full Next.js production build
   - Sentry source map upload (if token provided)

3. **E2E Tests** (runs on PRs only, after Build passes)
   - Playwright tests on Chromium
   - Test artifacts uploaded on failure

### Vercel Integration

Vercel automatically deploys when:
- Code is pushed to `main` branch
- CI checks pass (if branch protection is enabled)

The Vercel-GitHub integration handles:
- Preview deployments for PRs
- Production deployments for main
- Environment variable injection
- Build caching

## Setting Up Branch Protection (Recommended)

To prevent broken code from deploying:

1. Go to GitHub → Repository → Settings → Branches
2. Click "Add branch protection rule"
3. Set branch name pattern: `main`
4. Enable:
   - ✅ Require a pull request before merging
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
5. Select required status checks:
   - `Code Quality`
   - `Build`
6. Click "Create"

## Stripe Webhook Setup

For production, configure the Stripe webhook:

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://happy-sourdough.vercel.app/api/webhooks/stripe`
3. Select events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
4. Copy the signing secret to Vercel as `STRIPE_WEBHOOK_SECRET`

## Troubleshooting

### Build Failures

1. Check GitHub Actions logs for specific errors
2. Run locally: `npm run build`
3. Check for missing environment variables

### E2E Test Failures

1. Download test artifacts from GitHub Actions
2. Check `playwright-report/` for detailed results
3. Run locally: `npm run test:e2e:chromium`

### Deployment Not Updating

1. Verify push reached GitHub (check commits)
2. Check Vercel dashboard for deployment status
3. Check for build errors in Vercel logs
4. Verify environment variables are set

### Sentry Not Receiving Errors

1. Verify `NEXT_PUBLIC_SENTRY_DSN` is set in Vercel
2. Check browser console for Sentry initialization
3. Verify source maps uploaded (check Sentry releases)
