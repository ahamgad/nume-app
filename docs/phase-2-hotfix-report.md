# Phase 2 — P0 Hotfix Report

**Date:** June 9, 2026

## P0-1 — Dashboard login delay (~5s)

### Root cause

Multiple sequential gates blocked the dashboard shell after login:

| Step | Before | Est. cost |
|------|--------|-----------|
| `signInWithPassword` | Network round-trip | ~300–800ms |
| `router.refresh()` | Full RSC re-render + middleware | ~500–1500ms |
| Auth init | `getSession()` **and** `onAuthStateChange` (duplicate) | ~200–500ms |
| Finance gate | `isHydrated` required finance fetch to complete | ~300–1500ms |
| Dashboard UI | Full-page skeleton until all above finished | **User sees blank shell** |

The dashboard waited on `isHydrated = !authLoading && isFetched`, so the tab bar and header did not appear until Supabase accounts + records queries finished — even for new users with zero data.

### Fix

1. **Decouple shell from finance data** — `isHydrated` now means auth ready only; new `isFinanceReady` / `isFinanceLoading` for data widgets.
2. **Progressive dashboard** — Header + educational widgets render immediately; net worth card shows inline skeleton while finance loads.
3. **Remove duplicate auth init** — `AuthProvider` uses `onAuthStateChange` only (fires `INITIAL_SESSION`).
4. **Remove `router.refresh()` after login** — Client navigation + auth listener is sufficient; avoids redundant server pass.
5. **Singleton Supabase browser client** — One shared instance for consistent session attachment.
6. **`placeholderData` on finance query** — Smoother refetches without flashing empty state.

### Expected experience after fix

| Step | Time |
|------|------|
| Login submit → dashboard shell (header, tab bar, widgets) | **< 500ms** |
| Net worth data populated | +200–800ms (background) |
| Full interactive dashboard | When finance query resolves |

---

## P0-2 — Add Account failure

### Root cause

**Missing `GRANT` permissions for the `authenticated` role** on `public.accounts` and `public.records`.

Migration `001` created tables and RLS policies but did not grant table access to `authenticated`. Supabase SQL Editor migrations do not auto-grant like the dashboard table creator does.

Typical Supabase/PostgREST error:

```
permission denied for table accounts (42501)
```

This was swallowed by a generic `catch { setErrors({ form: t("common.retry") }) }` block.

### Fix

1. **`003_grants_authenticated.sql`** — Grants for existing projects.
2. **Updated `001`** — Grants included for fresh installs.
3. **`insertAccount`** — Calls `supabase.auth.getUser()` before insert to ensure JWT is attached for RLS.
4. **Error surfacing** — `getSupabaseErrorMessage()` + `console.error` in development; form shows actual error message.
5. **Optimistic cache update** — After insert, account is added to React Query cache immediately so Account Details loads without waiting for refetch.

### Required action on Supabase project

Run in SQL Editor:

```sql
-- supabase/migrations/003_grants_authenticated.sql
grant usage on schema public to postgres, anon, authenticated, service_role;
grant all on table public.accounts to authenticated;
grant all on table public.records to authenticated;
grant all on table public.accounts to service_role;
grant all on table public.records to service_role;
```

### Verify onboarding flow

1. Register → verify email → login
2. Dashboard shell appears quickly
3. Add first account → Continue
4. Toast → Account Details with correct balance
5. No "Try again" error

---

## Files changed

- `src/lib/supabase/client.ts` — singleton browser client
- `src/lib/supabase/errors.ts` — error formatting + dev logging
- `src/providers/auth-provider.tsx` — single auth listener
- `src/lib/finance/store.tsx` — progressive loading flags, cache update on create
- `src/lib/finance/service.ts` — session check + error messages on insert
- `src/components/screens/dashboard-screen.tsx` — progressive render
- `src/components/screens/add-account-screen.tsx` — surface Supabase errors
- `supabase/migrations/001_phase2_accounts_records.sql` — grants for new installs
- `supabase/migrations/003_grants_authenticated.sql` — grants hotfix for existing DBs
