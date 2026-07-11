# Phase 2 — Setup

## 1. Supabase project

1. Create a project at [supabase.com](https://supabase.com)
2. Copy **Project URL** and **anon public key** to `.env.local`:

```bash
cp .env.example .env.local
```

3. Run the migration in Supabase SQL Editor:

`supabase/migrations/001_phase2_accounts_records.sql`

4. In Supabase Auth settings:
   - Enable Email provider
   - Set **Site URL** to `http://localhost:3000` (or your production URL)
   - Configure the Magic Link email template with `{{ .Token }}` for OTP sign-in

5. Apply migration `002_rls_records_account_ownership.sql` (QA security fix)
6. Apply migration `003_grants_authenticated.sql` if accounts were created before grants were added to 001

## 2. Run locally

```bash
npm install
npm run dev
```

## 3. Auth flow

Register → verify email → sign in → Dashboard → add account (Tier 1 flow preserved)

## Architecture

- `(auth)/` — login, register, verify-email, forgot/reset password
- `(app)/` — protected Tier 1 experience (unchanged URLs)
- `middleware.ts` — session refresh + route guards
- `FinanceProvider` — Supabase via React Query (same `useFinance()` API)
- `docs/phase-2-auth.md` — full auth strategy

## Account types (progressive)

**Enabled in Add Account UI:** Current Account, Cash, Wallet  
**Schema ready, UI pending:** Savings, Certificate, Gold, Stocks, Loan, Credit Card

First account creation remains simplified (no type picker) — Tier 1 UX preserved.
