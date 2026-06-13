# Phase 3.1 — Certificates v1 Domain

Approved domain and architecture decisions for Certificates v1. This document preserves design decisions outside chat history and guides Phase 3.1b implementation.

**Source of truth:** `docs/NUME MVP V1.0.pdf` (PRD), with explicit product overrides noted below.

---

## Product Principles

* **Accounts are the Source of Truth** — Every wealth calculation originates from account balances. Records are an audit layer only; balances are not reconstructed from records.
* **Wealth-first, not expense-first** — Certificates are fixed-term wealth assets. They do not use the income/expense record flow applied to Current, Cash, or Wallet accounts.
* **Progressive Disclosure** — Ship configure, view, and computed expectations before full payout automation. Do not expose unfinished automation as broken UI.
* **Educational, not financial advice** — Display expected returns and schedules as informational projections. Copy must not imply guaranteed outcomes or advisory recommendations.
* **English + Arabic by default** — All user-facing certificate strings live in i18n catalogs (`en.ts`, `ar.ts`). No hardcoded copy.
* **RTL by default** — Layout uses logical properties (`start`/`end`, `text-start`). Chevrons and row patterns follow existing RTL conventions.

---

## Architecture

Certificates use a **two-layer model** aligned with PRD Chapter 11.7:

```
accounts (type = certificate)     ← source of truth for balance & net worth flags
        │
        └── certificates (1:1)    ← product configuration & schedule
```

### `accounts` row (`type = certificate`)

| Field | Role |
|-------|------|
| `name` | User-defined certificate label |
| `institution` | Optional bank / institution name |
| `current_balance` | Always equals principal (see Balance Rules) |
| `include_in_net_worth` | Default **ON** |
| `include_in_emergency_fund` | Default **OFF** (PRD §7.5) |
| `status` | `active` \| `archived` |

### `certificates` configuration row (1:1 via `account_id`)

| Field | Role |
|-------|------|
| `principal_amount` | Locked deposit amount |
| `annual_interest_rate` | Stored as **annual** percentage (PRD rule) |
| `purchase_date` | Certificate start date |
| `term_months` | Duration in whole months |
| `maturity_date` | End date (stored; derived from purchase + term) |
| `payout_frequency` | `monthly` \| `quarterly` \| `semi_annual` \| `annual` \| `at_maturity` |
| `destination_account_id` | Optional in v1 — liquid account for future interest payouts (see Approved Decisions) |
| `auto_apply` | Stored for schema compatibility; **out of scope for v1** — always `false`, no automation |
| `status` | `active` \| `matured` \| `archived` |

### Certificate Engine

All computed values are produced by a **single centralized module** (PRD §12.8). Screens and widgets consume engine output; calculations must not be duplicated across UI components.

---

## Balance Rules

* **`current_balance` always equals principal** — The certificate account balance never reflects accrued or paid interest.
* **Interest never increases certificate balance** — Interest payouts are transferred to the destination account (when automation runs) or displayed as expected values only. Reinvestment into principal is excluded from MVP (PRD §7.8, §11.7).

Manual corrections use the existing **adjustment** path on the linked account, creating an audit record without rebuilding balance from records.

---

## Calculation Rules

All rates are **annual**. Traditional Egyptian certificate products only; simple interest on principal; no compound-to-principal.

### `maturity_date`

```
maturity_date = purchase_date + term_months
```

Store `maturity_date` in the database for querying. Calendar-month addition uses one consistent rule across the engine (documented in implementation; end-of-month edge cases handled once).

### `expected_profit`

Simple interest over the full term:

```
expected_profit = principal × (annual_interest_rate / 100) × (term_months / 12)
```

### `expected_total_return`

Total cash returned over the life of the product (principal returned at maturity + interest paid out):

```
expected_total_return = principal + expected_profit
```

Interest is distributed to the destination account per payout schedule; it does not accumulate on the certificate.

### `current_value`

```
current_value = principal        (while status = active)
```

There is no mark-to-market. Display value for wealth purposes equals principal unless the user performs an explicit balance reconciliation adjustment.

### `next_payout_date`

1. Start from `purchase_date`.
2. Advance by payout frequency interval (`monthly`, `quarterly`, `semi_annual`, `annual`).
3. Return the first date **≥ today** that is **≤ maturity_date**.
4. If frequency is `at_maturity`, or all payout dates have passed, return `null`.

When `auto_apply` is disabled, `next_payout_date` still shows the **expected** schedule for educational display.

### Optional display fields (v1)

| Field | Formula |
|-------|---------|
| `remaining_days` | `max(0, maturity_date − today)` |
| `accrued_interest_to_date` | Linear accrual for display only: `expected_profit × (elapsed_months / term_months)`, capped at `expected_profit`. Does **not** change balance. |

---

## Dashboard Integration

| Surface | v1 behavior |
|---------|-------------|
| **Net Worth** | **APPROVED:** Certificate **principal** included when `include_in_net_worth = ON` and account is active. |
| **Asset Allocation** | Future support — certificates appear in the **Certificates** bucket (PRD §5.8, §9.9). Not required for initial 3.1b slice if Net Worth wiring ships first. |
| **Recent Activity** | Interest payouts appear as **system records on the destination account**, not as income/expense on the certificate. Certificate detail may reference linked payout records. Dashboard Recent Activity follows existing record sources. |
| **Emergency Fund** | Excluded by default (`include_in_emergency_fund = OFF`). |
| **Goals** | No direct certificate → goal link. Goals consume **Available Wealth** only (see below). |

---

## Available Wealth Decision

> **APPROVED PRODUCT DECISION** — This supersedes the literal PRD interpretation where certificate principal flows into Available Wealth via Net Worth alone.

**Certificates are INCLUDED in Net Worth but EXCLUDED from Available Wealth because principal is locked until maturity.**

```
Available Wealth = Net Worth − Required Emergency Fund − Locked Certificate Principal
```

Where **Locked Certificate Principal** = sum of `principal_amount` (or `current_balance`) for all **active** certificate accounts with `include_in_net_worth = ON`.

### Rationale

* Net Worth reflects total wealth position (user sees full picture).
* Available Wealth reflects **spendable / goal-fundable** wealth (PRD Sequential Goals philosophy).
* Certificate principal cannot fund goals until maturity or explicit product workflow says otherwise.

### Implementation note

When the Goals and Available Wealth engines are built, they must apply this exclusion. Net Worth calculation remains unchanged.

---

## Scope

### In Scope

* CRUD (create, read, update)
* Archive (soft delete via account/certificate status)
* Computed displays (maturity, expected profit, next payout, remaining days)
* Net Worth integration (principal in assets)
* i18n + RTL (English and Arabic copy, logical layout)
* Manual adjustment path (balance reconciliation via adjustment record on account)

### Out of Scope

* Early redemption
* Reinvestment (interest into principal or new certificate at maturity)
* Variable / tiered interest rates
* Taxes and withholding
* Multi-currency
* Push notifications and payout reminders
* Funding flow (transfer from current account to open certificate)
* **`auto_apply` automation** — cron / edge jobs, system payout records, destination balance updates (deferred post–v1)

---

## Approved Product Decisions

All items below are **approved** for Certificates v1 implementation.

| Decision | Status | v1 rule |
|----------|--------|---------|
| Net Worth inclusion | **APPROVED** | Certificate principal is **included** in Net Worth when `include_in_net_worth = ON` and account is active. |
| Available Wealth exclusion | **APPROVED** | Certificate principal is **excluded** from Available Wealth (locked until maturity). Supersedes literal PRD Available Wealth formula. |
| `destination_account_id` | **APPROVED** | **Optional** on create in v1. May be omitted. Required only when payout automation ships in a future phase. |
| `auto_apply` | **APPROVED** | **Out of scope for v1.** Field may exist in schema defaulting to `false`. UI shows expected payout schedule only; no automated posting. |
| Matured lifecycle | **APPROVED** | **Manual.** At or after `maturity_date`, user manually marks matured / archives / reconciles principal. No auto-transfer or auto-archive in v1. |

### Matured lifecycle (approved detail)

1. System may surface maturity state in UI when `today ≥ maturity_date` (informational).
2. User initiates archive or balance adjustment manually.
3. No automatic system records, transfers, or account closure in v1.

---

## Related PRD References

| Topic | PRD section |
|-------|-------------|
| Certificate accounts | §7.8 |
| Certificate engine | §2.3 |
| Database schema | §11.7 |
| Net Worth | §5.4, §9.4 |
| Available Wealth | §8.3, §9.6 |
| Asset allocation | §5.8, §9.9 |
| Records layer | §7.13 |
| MVP screens | §13 (Certificate Account Screen) |

---

## Implementation sequence (Phase 3.1b+, not started)

1. Migration: `certificates` table + RLS
2. Domain: certificate engine (pure computation)
3. Service layer + finance store extension
4. Screens: Add Certificate, Certificate Details
5. Net Worth calculator: treat certificate accounts as principal-only assets
6. Available Wealth engine: apply locked-principal exclusion when Goals ship
7. i18n keys in `en.ts` / `ar.ts`

**Status:** Domain and product decisions approved and documented. Ready for Phase 3.1b. No migrations, services, UI, or code changes until implementation begins.
