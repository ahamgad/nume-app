# Phase 2 — QA & Stabilization Report

**Date:** June 9, 2026  
**Scope:** Authentication, Supabase persistence, RLS security, PWA behavior  
**Method:** Static code audit, build/lint verification, architecture review. Live Supabase E2E pending project configuration (no `.env.local` in repo).

---

## Executive Summary

Phase 2 architecture is sound and builds cleanly. Tier 1 UI and flows are preserved. Several **auth deep-link and middleware edge cases** were identified during review; **three critical fixes were applied** in this stabilization pass (auth callback route, reset-password redirect guard, verify-email session refresh).

**Live E2E validation requires:** Supabase project + `.env.local` + SQL migrations + Auth redirect URLs. Until configured, runtime pass/fail for auth and persistence flows is **BLOCKED — pending environment**.

---

## QA Checklist

### Authentication

| Test | Status | Notes |
|------|--------|-------|
| Registration (email + password) | **PASS** (code) / **BLOCKED** (live) | Form validates; `signUp` → `/verify-email`. Min 8 chars on client. |
| Email verification gate | **PASS** (code) / **BLOCKED** (live) | Middleware blocks unverified users from app routes. |
| Email verification deep link | **FIXED** | Was **FAIL** — no PKCE callback. Added `/auth/callback` + redirect URLs. Re-test live. |
| Login | **PASS** (code) / **BLOCKED** (live) | Credentials → dashboard; errors surfaced inline. |
| Login while unverified | **PASS** (code) | Middleware redirects to `/verify-email`. |
| Logout | **PASS** (code) / **BLOCKED** (live) | More tab → `signOut()` → `/login`. |
| Session persistence (browser refresh) | **PASS** (code) / **BLOCKED** (live) | Supabase SSR cookies + middleware refresh. |
| Session persistence (new tab) | **PASS** (code) / **BLOCKED** (live) | Cookie-based session shared across tabs. |
| Forgot password | **PASS** (code) / **BLOCKED** (live) | Generic success message (no email enumeration). |
| Reset password deep link | **FIXED** | Was **FAIL** — verified users redirected away from `/reset-password`. Middleware exception added. Callback route added. |
| Reset password submit | **PASS** (code) / **BLOCKED** (live) | Updates password → `/login`. Does not auto sign-out (see UX). |
| Redirect: unauthenticated → login | **PASS** (code) | Middleware guard when env configured. |
| Redirect: unverified → verify-email | **PASS** (code) | Middleware guard. |
| Redirect: verified on auth route → dashboard | **PASS** (code) | Except `/reset-password` (intentional). |
| Auth without Supabase env | **WARN** | Middleware skips protection; app fully open. Dev convenience, **production risk**. |

### Supabase Persistence

| Test | Status | Notes |
|------|--------|-------|
| Current Account creation (first account) | **PASS** (code) / **BLOCKED** (live) | No type picker; defaults to `current_account`. |
| Cash account creation | **PASS** (code) / **BLOCKED** (live) | Type chips on 2nd+ account. |
| Wallet account creation | **PASS** (code) / **BLOCKED** (live) | Same progressive UI. |
| Income record | **PASS** (code) / **BLOCKED** (live) | Balance += amount; toast + redirect. |
| Expense record | **PASS** (code) / **BLOCKED** (live) | Balance -= amount. |
| Adjustment record | **PASS** (code) / **BLOCKED** (live) | Stores delta; sets balance to target. |
| Net Worth calculation | **PASS** (code) | Sums included accounts; assets/liabilities split. |
| Net Worth toggle (exclude account) | **PASS** (code) / **BLOCKED** (live) | Toggle on Account Details updates Supabase. |
| Data persistence after refresh | **PASS** (code) / **BLOCKED** (live) | React Query refetch from Supabase. |
| Data persistence across sessions | **PASS** (code) / **BLOCKED** (live) | User-scoped DB rows. |
| Invalid account ID in URL | **PASS** (code) | Shows not-found state; no crash. |
| Query failure handling | **FAIL** | No error UI; failed fetch shows empty state silently. |
| Record + balance atomicity | **FAIL** | Two sequential writes; partial failure possible. |

### Security (RLS)

| Test | Status | Notes |
|------|--------|-------|
| RLS enabled on `accounts` | **PASS** (schema) | Migration 001. |
| RLS enabled on `records` | **PASS** (schema) | Migration 001. |
| User A cannot read User B accounts | **PASS** (expected) / **BLOCKED** (live) | `auth.uid() = user_id` on SELECT. |
| User A cannot update User B accounts | **PASS** (expected) / **BLOCKED** (live) | UPDATE policy scoped by user_id. |
| User A cannot read User B records | **PASS** (expected) / **BLOCKED** (live) | SELECT policy scoped by user_id. |
| Cross-user record insert (foreign account_id) | **FIXED** | Was **FAIL** — insert policy did not verify account ownership. Migration 002 adds check. |
| Deploy without Supabase env | **FAIL** (risk) | Auth bypass; finance mutations throw at runtime. |
| Service role key in client | **PASS** | Only anon key in client bundle. |

### PWA

| Test | Status | Notes |
|------|--------|-------|
| Web manifest present | **PASS** | `public/manifest.json` linked in root layout. |
| Icons (192, 512, maskable) | **PASS** | Generated PNGs in `public/icons/`. |
| Apple touch icon | **PASS** | Metadata configured. |
| `display: standalone` | **PASS** | Manifest setting correct. |
| Service worker / offline | **FAIL** | No SW registered; installable but no offline cache or update strategy. |
| Installation flow | **BLOCKED** (live) | Requires HTTPS + manual device test. |
| Standalone session persistence | **PASS** (expected) | Same cookie session as browser; **BLOCKED** (live). |
| Post-deploy update behavior | **FAIL** | No SW; users get network-first Next.js behavior only. |
| Logout/login in standalone | **PASS** (expected) / **BLOCKED** (live) | Same auth stack as browser. |

### Build & Quality

| Test | Status | Notes |
|------|--------|-------|
| `npm run lint` | **PASS** | After stabilization fixes. |
| `npm run build` | **PASS** | 18 routes; middleware proxy active. |
| TypeScript | **PASS** | Clean compile. |

---

## Bugs Discovered

### Critical (fixed in this pass)

| ID | Bug | Impact | Resolution |
|----|-----|--------|------------|
| B-01 | Missing `/auth/callback` route | Email verify + password reset links fail PKCE exchange | Added `src/app/auth/callback/route.ts`; updated redirect URLs |
| B-02 | Middleware redirects verified users away from `/reset-password` | Password reset flow broken for logged-in users | Exempt `/reset-password` from auth-route redirect |
| B-03 | Verify Email "Continue" checks stale `user` after refresh | Users verified via link still blocked | `refreshSession()` returns fresh user; Continue uses return value |

### High (open)

| ID | Bug | Impact | Recommendation |
|----|-----|--------|----------------|
| B-04 | Records RLS missing account ownership on INSERT | Cross-user orphan records possible via direct API | Apply migration `002_rls_records_account_ownership.sql` |
| B-05 | Record insert + balance update not atomic | Data inconsistency if account update fails after record insert | Add Postgres RPC with transaction |
| B-06 | No finance query error state | Network/RLS errors appear as empty accounts | Surface `isError` + retry in finance store |
| B-07 | Deploy without env bypasses auth | Production misconfiguration exposes app | Fail CI/build when env missing in production |

### Medium (open)

| ID | Bug | Impact | Recommendation |
|----|-----|--------|----------------|
| B-08 | Reset password leaves recovery session active | User lands on login but may still have session cookie | Call `signOut()` after successful password update |
| B-09 | Raw Supabase error strings in auth UI | Poor UX for "Invalid login credentials" etc. | Map errors to i18n keys |
| B-10 | Login allows unverified sign-in before redirect | Brief flash of protected route possible | Check `email_confirmed_at` client-side before redirect |
| B-11 | No password confirmation on register/reset | User typos lock themselves out | Add confirm password field (Beta) |

### Low (open)

| ID | Bug | Impact | Recommendation |
|----|-----|--------|----------------|
| B-12 | Toggle settings fire-and-forget (`void updateAccount`) | Silent failure on network error | Add toast on error + revert toggle |
| B-13 | Expense can drive balance negative | May be intentional for Tier 1 | Confirm with PRD; document behavior |

---

## UX Improvements Identified

1. **Auth error copy** — Replace raw Supabase messages with friendly, localized strings.
2. **Verify email** — Auto-detect verification when user returns via deep link (reduce manual "Continue" tap).
3. **Reset password** — Sign out after success; show "Password updated" confirmation before login.
4. **Loading vs empty** — Distinguish "no accounts yet" from "failed to load" with retry action.
5. **Forgot password while logged in** — Either hide link or explain they'll stay signed in.
6. **Register success** — Show explicit "Check your inbox" with spam-folder hint before redirect.
7. **Account settings toggles** — Optimistic UI with rollback on failure.
8. **PWA install prompt** — Consider lightweight `beforeinstallprompt` handler post-Beta (not Tier 1 scope).

---

## Technical Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Missing Supabase env in production | **Critical** | Enforce env in CI; add runtime health check |
| Non-atomic record writes | **High** | Postgres function wrapping insert + update |
| No service worker | **Medium** | Accept for Beta; plan SW for offline shell + updates |
| React Query stale data after tab sleep | **Low** | `refetchOnWindowFocus: true` (verify in QueryClient defaults) |
| Single migration path (no rollback docs) | **Low** | Document migration order in setup guide |
| Email deliverability (Supabase default) | **Medium** | Configure custom SMTP before Beta users |

---

## Recommendations Before Beta

### Must do

1. **Configure Supabase** — Apply migrations 001 + 002; set Auth redirect URLs:
   - `{APP_URL}/auth/callback?next=/verify-email`
   - `{APP_URL}/auth/callback?next=/reset-password`
2. **Run live E2E** — Two-user RLS test per `supabase/tests/rls_validation.sql`.
3. **Fix B-05** — Atomic record transaction before Beta traffic.
4. **Fix B-06** — Finance error states with retry.
5. **Enforce env in production** — Fail deploy if Supabase vars missing.

### Should do

6. **Auth UX polish** — Error mapping, reset sign-out, verify auto-continue.
7. **Custom SMTP** — Reliable verification and reset emails.
8. **Monitoring** — Supabase logs + basic client error reporting.

### Can defer (post-Beta)

9. Service worker + update strategy.
10. localStorage Tier 1 data import.
11. Password confirmation fields.

---

## Stabilization Changes Applied

| File | Change |
|------|--------|
| `src/app/auth/callback/route.ts` | PKCE code exchange for email verify + password reset |
| `src/lib/supabase/middleware.ts` | Callback passthrough; reset-password redirect exception |
| `src/providers/auth-provider.tsx` | Callback redirect URLs; `refreshSession` returns user; lint fix |
| `src/components/screens/auth-screens.tsx` | Verify continue uses fresh session |
| `supabase/migrations/002_rls_records_account_ownership.sql` | Records INSERT/UPDATE account ownership check |

---

## Live E2E Test Script (for your Supabase project)

```
1. Register user@test.com → verify email via inbox link
2. Confirm redirect lands on /verify-email or dashboard after callback
3. Add Current Account (name + balance) → Account Details
4. Add income 1000 → balance updates
5. Add expense 200 → balance updates
6. Add adjustment to exact balance → verify delta record
7. Refresh browser → data persists
8. Logout → login again → data persists
9. Register second user → confirm User B sees empty state
10. (DevTools) User B attempts User A account UUID → no access
11. Install PWA on iOS/Android → repeat steps 3–8 in standalone
12. Forgot password → reset via email → login with new password
```

---

## Verdict

**Foundation: conditionally ready for Beta.**

Code structure, Tier 1 preservation, and RLS design are solid. **Live validation is the gating item.** Apply the stabilization fixes, run migrations, complete the E2E script above, and address B-05/B-06 before inviting Beta users.

Certificates, Gold, and Loans remain **blocked** until this checklist is green.
