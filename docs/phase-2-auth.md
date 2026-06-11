# Phase 2 — Authentication Readiness

Authentication remains **in scope for MVP** per the PRD (Chapter 4). Tier 1 intentionally ships without auth to validate the core wealth loop. This document defines how Supabase Auth integrates in Phase 2 without rework.

## MVP Authentication Scope (PRD)

Included:

- Registration (email + password)
- Email verification (required gate)
- Login
- Forgot password / reset
- Logout
- Persistent sessions (Supabase-managed)

Excluded from MVP:

- Biometrics, social login, passkeys, MFA

## Current Architecture Readiness

| Area | Tier 1 state | Phase 2 action |
|------|--------------|----------------|
| Route structure | All routes under `(app)` are open | Add `(auth)` route group + middleware guard |
| Data layer | `FinanceProvider` + localStorage | Replace with Supabase client + RLS-protected queries |
| User context | None | Add `AuthProvider` wrapping `FinanceProvider` |
| i18n | Locale in `I18nProvider` | Unaffected |
| More → Logout | Placeholder redirect | Wire to `supabase.auth.signOut()` |

The UI shell, tab navigation, and screen components require **no structural changes** — only route guards and data source swaps.

## Intended Authentication Flow

```
Register (email, password)
  → Supabase signUp
  → Email Verification Gate (block app until verified)
  → Login
  → Dashboard

Forgot Password
  → resetPasswordForEmail
  → Deep link → Reset Password screen
  → Login

Logout
  → signOut → clear session → Login
```

Unverified users must not access financial data. The verification gate is a dedicated screen, not a tab.

## Protected Route Strategy

### Middleware (`middleware.ts`)

```typescript
// Pseudocode — Phase 2 implementation
const publicRoutes = ["/login", "/register", "/forgot-password", "/reset-password", "/verify-email"];
const session = await getSupabaseSession(request);

if (!session && !isPublicRoute) → redirect("/login");
if (session && !session.user.email_confirmed_at && !isVerifyRoute) → redirect("/verify-email");
if (session && isAuthRoute) → redirect("/");
```

### Route Groups

```
src/app/
  (auth)/           ← login, register, verify, forgot, reset
  (app)/            ← current shell (protected)
```

Tier 1 routes move under `(app)/` with no URL change.

### Session Handling

- Supabase Auth cookies via `@supabase/ssr`
- Server Components fetch session in layout; client hydrates via `AuthProvider`
- `FinanceProvider` receives `userId` from auth context — all queries scoped by RLS

## Data Migration Path

1. Add Supabase project + env vars (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
2. Implement schema per PRD Chapter 11 with RLS on all tables
3. Create service layer: `accountsService`, `recordsService` (abstracts Supabase)
4. Swap `FinanceProvider` internals from localStorage to TanStack Query + services
5. Optional: one-time import prompt for Tier 1 localStorage data (post-MVP)

## Security Requirements (PRD)

- Row Level Security on all financial tables
- User isolation — no cross-user data access
- Secure session storage via Supabase
- Protected API routes if any server actions are added

## Recommendation

Implement auth **before** expanding account types in Phase 2. Financial data should never persist to localStorage in production. The Tier 1 localStorage store is a vertical-slice trade-off only.

## Checklist for Phase 2 Auth PR

- [x] Supabase client + env configuration (`.env.example`, clients, middleware)
- [x] `(auth)` screens matching PRD inventory
- [x] Middleware route protection
- [x] Email verification gate
- [x] `AuthProvider` + session refresh
- [x] Logout wired in More tab
- [x] Finance data migrated to Supabase service layer + React Query
- [x] localStorage persistence removed from finance store
- [ ] Run SQL migration on your Supabase project
- [ ] Configure Supabase Auth redirect URLs
