# Phase 3.1.1 — Business Days Engine

Status: **Implementation complete — pending Product Owner approval before deployment.**

## Overview

Daily interest processing for Savings Accounts and Certificates can skip non-business days using two toggles (both default **ON**):

- **Exclude weekends** — Friday and Saturday (Egypt-first weekend)
- **Exclude official Egyptian holidays** — dates stored locally in `egyptian_holidays`

Non-daily frequencies are unchanged.

## Database changes

Migration: `supabase/migrations/011_business_days_engine.sql`

| Object | Purpose |
|--------|---------|
| `egyptian_holidays` | Local holiday calendar (`date` PK, `name`, `is_observed`, `updated_at`) |
| `holiday_sync_state` | Sync metadata (`last_attempt_at`, `last_success_at`, `last_error`) |
| `savings_accounts.exclude_weekends` | Default `true` |
| `savings_accounts.exclude_egyptian_holidays` | Default `true` |
| `certificates.exclude_weekends` | Default `true` |
| `certificates.exclude_egyptian_holidays` | Default `true` |

RLS: authenticated users may **read** holidays; writes use service role during sync.

## Sync architecture

```
Google Calendar (public iCal feed)
        │
        ▼  fetch (cron only — never during payout)
  /api/cron/sync-egyptian-holidays
        │
        ▼  parse VEVENT → upsert
  egyptian_holidays (local table)
        │
        ▼  SELECT is_observed = true
  Savings / Certificate daily engines
```

**Source of truth:** Google Calendar Egyptian public holidays feed  
(`EGYPTIAN_HOLIDAYS_ICAL_URL` optional override; default is Google's `en.eg#holiday@group.v.calendar.google.com` public ICS).

**Cadence:** Every 2 weeks. `shouldRunHolidaySync()` enforces a 14-day minimum between successful syncs. Vercel cron hits the endpoint on the 1st and 15th of each month (`vercel.json`).

**Runtime rule:** Payout and catch-up processors **never** call Google. They only read `egyptian_holidays` via `loadObservedHolidayDatesSafe()`.

## Failure strategy

| Scenario | Behavior |
|----------|----------|
| Sync fails | Logged in `holiday_sync_state.last_error`; no user-facing error |
| Empty or stale holiday table | Holiday exclusion is best-effort; weekends still excluded when that toggle is ON |
| DB read failure in engine | Empty holiday set returned; same as above |

Engines continue operating normally — sync failure does **not** block interest processing.

## Engine behavior (Daily only)

### Shared calendar module (`src/lib/business-days/`)

- `isEgyptianWeekend()` — Friday/Saturday (UTC date parts)
- `isEligibleDailyPayoutDate()` — applies toggles + local holidays
- `iterateEligibleDailyPayoutDates()` — schedule generation and catch-up ranges
- `firstEligibleDailyPayoutDateAfter()` / `nextEligibleDailyPayoutDateAfter()` — next posting/payout

When **both toggles are OFF**, daily behavior matches pre-3.1.1 (every calendar day).

### Savings

- Toggles persisted on `savings_accounts`
- `posting-schedule.ts` accepts optional `DailyBusinessDayContext`
- `interest-processor.ts` skips non-business days during catch-up (advances `next_posting_date` without creating records)
- UI: Business Days section shown when posting frequency = Daily

### Certificates

- Toggles persisted on `certificates`
- `schedule-generator.ts` materializes daily entries only on eligible dates
- `schedule-service.ts` loads holidays before regeneration when daily + holiday exclusion enabled
- `certificate-engine.ts` uses business-day logic for next payout display
- UI: Business Days section shown when payout frequency = Daily

## Environment variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `SUPABASE_SERVICE_ROLE_KEY` | Cron sync | Service role client for holiday upserts |
| `CRON_SECRET` | Recommended | Bearer auth for cron route |
| `EGYPTIAN_HOLIDAYS_ICAL_URL` | Optional | Override Google iCal feed URL |

## Test coverage

| Area | Tests |
|------|-------|
| Calendar / weekends / holidays | `src/lib/business-days/calendar.test.ts` |
| iCal parsing | `src/lib/business-days/holiday-ical.test.ts` |
| Sync success + failure fallback | `src/lib/business-days/holiday-sync.test.ts` |
| Certificate schedule + catch-up | `src/lib/certificates/schedule-generator.test.ts` |
| Certificate next payout | `src/lib/certificates/certificate-engine.test.ts` |
| Savings posting schedule | `src/lib/savings/savings.test.ts` |

## Assumptions

1. Egypt-first: weekend = Friday + Saturday; all dates use ISO `YYYY-MM-DD` with UTC day-of-week for weekend checks (consistent with certificate engine).
2. Google public holiday feed is sufficiently accurate for official Egyptian holidays; no manual curation UI in this phase.
3. Daily certificates with holiday exclusion load holidays at schedule regeneration time, not on every UI render.
4. Existing non-daily accounts inherit default `true` for both columns via migration defaults; behavior unchanged because business-day logic applies only when frequency is Daily.

## Open questions / recommendations

1. **PO approval** — Phase 3.1.1 should not deploy until Product Owner signs off on defaults (both toggles ON) and holiday source.
2. **Manual holiday overrides** — Consider an admin tool to mark `is_observed = false` for edge cases Google gets wrong.
3. **Cron monitoring** — Alert on repeated `holiday_sync_state.last_error` so stale holiday data is visible ops-side (no user impact).
4. **Timezone** — If NUME adds non-Egypt regions, weekend and holiday rules will need locale-aware configuration.

## Deployment checklist (after PO approval)

1. Apply migration `011_business_days_engine.sql` to production Supabase
2. Set `SUPABASE_SERVICE_ROLE_KEY` and `CRON_SECRET` in Vercel
3. Trigger initial holiday sync: `GET /api/cron/sync-egyptian-holidays` with Bearer token
4. Run full test suite and production build
5. Deploy application
