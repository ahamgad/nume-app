# Planning — surface inventory

**Module:** Planning  
**Route:** `/planning`  
**Primary component:** `src/components/screens/stub-tab-screens.tsx` → `PlanningScreen`  
**Product maturity:** Stub  
**Inventory version:** 1.0  
**Status:** Review complete · **Implementation:** Complete

### Runtime legend

| Category | Reviewable? | Meaning |
|---|---|---|
| **Static i18n** | Yes | Governed string from `en.ts` / `ar.ts` |
| **Generated copy** | Yes | String composed via `t()` or a formatter that selects i18n keys |
| **User content** | No | User-entered names, descriptions |
| **Formatted value** | No | Locale-formatted currency, dates, numbers |
| **Non-verbal** | No | Skeleton, animation, or UI with no copy |

### Review status legend

`Not reviewed` · `Keep` · `Revise` · `Missing` · `Implementation gap` · `Foundation gap` · `Deferred`

---

## Surface ID → file / component index

| ID | File / component |
|---|---|
| P-01 | `src/components/layout/tab-bar.tsx` |
| P-02 | `src/components/layout/tab-bar.tsx` |
| P-03 | `src/components/screens/stub-tab-screens.tsx` → `RootPageHeader` |
| P-04 | `src/components/screens/stub-tab-screens.tsx` → `RootPageTitle` |
| P-05 | `src/components/screens/stub-tab-screens.tsx` → `EmptyState` (title) |
| P-06 | `src/components/screens/stub-tab-screens.tsx` → `EmptyState` (description) |
| P-07 | `src/components/screens/stub-tab-screens.tsx` → `EmptyState` → `Button` |
| P-08 | `src/components/layout/screen-header.tsx` → `ScreenBody` → `PullToRefreshIndicator` |
| P-09 | `src/hooks/use-pull-to-refresh.ts` → `src/components/connectivity/connectivity-toasts.tsx` |
| P-10 | `src/lib/finance/store.tsx` → `refresh` (no Planning-specific error UI) |

---

## Module boundary

**In scope:** Planning tab-root (`/planning`) and all copy rendered while the user is on the Planning tab.

**Current product state:** Pre-feature stub — the screen always renders the empty state. When the user has accounts, the CTA is hidden but title and body remain.

**Out of scope:**

- Goals module (`/goals` — separate inventory)
- Account create flow (`/accounts/new` → Accounts module)
- Dashboard cash-flow widget copy that references Planning (`dashboard.widgets.cashFlow.hint` → Dashboard inventory)
- Non-Planning tab labels

---

## Surfaces

### Entry & shell

| ID | Surface | Runtime | Reviewable | Owning module | i18n / source | Visibility | Review status |
|---|---|---|---|---|---|---|---|
| P-01 | Tab bar — Planning label | Static i18n | Yes | Navigation *(deferred IA)* | `nav.planning` | Tab bar on `/planning` | **Deferred** → Navigation & IA |
| P-02 | Tab bar — nav landmark | Static i18n | Yes | Common | `a11y.mainNavigation` | Tab bar on `/planning` | **Keep** |
| P-03 | Collapsed header title | Static i18n | Yes | Planning | `planning.title` | Always | **Keep** |
| P-04 | Large page title | Static i18n | Yes | Planning | `planning.title` | Always | **Keep** |

### Empty state (sole content)

| ID | Surface | Runtime | Reviewable | Owning module | i18n / source | Visibility | Review status |
|---|---|---|---|---|---|---|---|
| P-05 | Empty state — title | Static i18n | Yes | Planning | `planning.empty.title` | Always | **Keep** |
| P-06 | Empty state — body | Static i18n | Yes | Planning | `planning.empty.body` | Always | **Keep** |
| P-07 | Empty state — CTA | Static i18n | Yes | Planning | `planning.empty.linkAccounts` | `!hasAccounts` only | **Revise** ✓ |

### Pull-to-refresh & errors

| ID | Surface | Runtime | Reviewable | Owning module | i18n / source | Visibility | Review status |
|---|---|---|---|---|---|---|---|
| P-08 | Pull-to-refresh indicator | Non-verbal | No | — | Animation (`aria-hidden`) | On pull / refresh | — |
| P-09 | Offline pull toast | Static i18n | Yes | Connectivity | `connectivity.offline.title`, `.description` | Offline pull attempt | **Keep** |
| P-10 | Finance refresh failure | Static i18n | Yes | Planning | `planning.error` | Failed `refresh` on Planning | **Implementation gap** ✓ |

---

## Dormant i18n

| ID | Key | Classification |
|---|---|---|
| — | — | No dormant `planning.*` keys — all four keys in `planning` namespace are used |

---

## Surfaces absent on Planning

| Surface type | Present |
|---|---|
| Detail screens | No |
| Create / edit flows | No |
| Bottom sheets | No |
| Dialogs / drawers | No |
| Menus (in-module) | No |
| Loading skeleton | No |
| Success toasts | No |
| Validation states | No |
| Confirmation flows | No |
| Populated / non-empty state | No *(stub only)* |
| Runtime-generated copy | No |

---

## Reviewable copy by owning module

| Owning module | IDs |
|---|---|
| **Planning** | P-03 – P-07, P-10 |
| **Common** | P-02 |
| **Connectivity** | P-09 |
| **Navigation** *(deferred IA)* | P-01 |

---

## Inventory completeness statement

Built from implementation inspection — not translation files alone.

**Routes inspected**

- `src/app/(app)/planning/page.tsx` → `/planning`
- Confirmed: `PlanningScreen` is rendered only on `/planning`; no nested Planning routes

**Components inspected**

- `src/components/screens/stub-tab-screens.tsx` → `PlanningScreen`
- Children: `RootPageHeader`, `RootPageTitle`, `ScreenBody`, `EmptyState`, `Button`
- Shared chrome on `/planning`: `TabBar` via `app-shell.tsx`
- Pull-to-refresh: `ScreenBody` → `usePullToRefresh` → `PullToRefreshIndicator`
- Cross-module: `connectivity-toasts.tsx` (offline pull path)
- Data: `useFinance()` — `accounts`, `refresh` (controls CTA visibility only)

**i18n traced**

- `planning.title`, `planning.error`
- `planning.empty.title`, `.body`, `.linkAccounts`
- `nav.planning`, `a11y.mainNavigation`
- `connectivity.offline.*` (offline-pull path)

**Conclusion:** All routes belonging to the Planning module were inspected. All components rendered from those routes were inspected. No additional user-facing surfaces were found beyond **P-01 – P-10**.

---

## Summary

| Category | Count |
|---|---|
| Total surface IDs | **10** |
| Reviewable | **8** |
| Non-reviewable | **1** (P-08) |
| Cross-module reviewable | **2** (P-02 Common, P-09 Connectivity; P-01 Navigation deferred) |
| Dormant i18n | **0** |
| Absent surface types | 10 types confirmed absent |

**Next step:** Planning module complete. Proceed to **Accounts** preparation.

| Status | Count | IDs |
|---|---|---|
| **Keep** | 6 | P-02 – P-06, P-09 |
| **Revise** *(implemented)* | 1 | P-07 |
| **Implementation gap** *(resolved)* | 1 | P-10 |
| **Deferred** | 1 | P-01 |
| **Missing** | 0 | — |
| **Foundation gap** | 0 | — |
| Non-reviewable | 1 | P-08 |

*Stub maturity: no Missing items for future Planning functionality (budgets, income/expense modeling, populated state).*

---

## Revisions

### P-05 · `planning.empty.title` — **Keep**

| | |
|---|---|
| **Decision** | Keep **Plan your money with confidence.** / **خطّط لأموالك بثقة.** |
| **Foundation rationale** | Writing Patterns §5 — stub orientation empty state (parallel to Goals pre-accounts example); tier-1 approved baseline; Voice & Tone — forward-looking, not unfinished |

### P-06 · `planning.empty.body` — **Keep**

| | |
|---|---|
| **Decision** | Keep current EN / AR body copy |
| **Foundation rationale** | Writing Patterns §5 — explains why the section matters; tier-1 approved baseline; Content Principles §1 — clarity without feature tour |

### P-07 · `planning.empty.linkAccounts` — **Implemented**

| | EN | AR |
|---|---|---|
| **Was** | Start with your accounts | ابدأ بحساباتك |
| **Now** | Start with your first account | ابدأ بحسابك الأول |
| **Foundation rationale** | Writing Patterns §5 (empty states) — first-account CTA when routing to `/accounts/new`; matches `accounts.empty.action` |
| **Impact** | Pattern, Clarity |

### P-10 · Finance refresh failure — **Implemented**

| | EN | AR |
|---|---|---|
| **Added** | `planning.error` — Unable to refresh | تعذّر التحديث |
| **Wiring** | `PlanningScreen` surfaces `isFinanceLoadError` above empty state |
| **Foundation rationale** | Writing Patterns §7 (transient states) — brief failure status on pull-to-refresh; same gap class as Dashboard D-36 |
| **Impact** | Pattern, Clarity |

---

## Module completion record

| Field | Value |
|---|---|
| **Module** | Planning |
| **Review date** | 2026-06-30 |
| **Inventory version** | 1.0 |
| **Product maturity** | Stub |
| **Final counts** | Keep **6** · Revise **1** (implemented) · Missing **0** · Implementation gap **1** (resolved) · Deferred **1** · Foundation gap **0** |
| **Deferred items** | P-01 → Navigation & IA |
| **Foundation changes introduced** | Product maturity classification added to review workflow (`REVIEW-CHECKLIST.md`) |
| **Build / test status** | `npm test` — 354 passed · `npm run build` — succeeded |
