# Goals — surface inventory

**Module:** Goals  
**Route:** `/goals`  
**Primary component:** `src/components/screens/stub-tab-screens.tsx` → `GoalsScreen`  
**Product maturity:** Stub  
**Inventory version:** 1.0  
**Status:** Review complete · **Implementation:** Complete

### Module review rules (locked during Goals review)

1. **Recovery action labels** — describe destination or action; never reuse a screen title (`accounts.navigation.backToList` pattern).
2. **Pattern propagation** — when a pattern is found, search the whole module during that group's review; note cross-group items in the inventory.
3. **Shared copy** — review identical i18n keys, generated strings, or shared components once at the source; propagate classification to all affected surfaces.
4. **Review priority** — unique copy first, then unreviewed shared sources, then Revise/Deferred sources, then propagate approved shared sources without full re-review unless source, context, or Foundation scope changes.
5. **Source ownership** — one authoritative record per shared source in the **Shared source registry**; later groups reference it; reopen only when source, context, or Foundation scope changes.

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

### Review groups

| Group | IDs | Reviewable |
|---|---|---|
| [Module entry & navigation](#module-entry--navigation) | G-01 – G-04 | 3 |
| [Empty state](#empty-state) | G-05 – G-08 | 3 |
| [Pull-to-refresh & transient](#pull-to-refresh--transient) | G-09 – G-10 | 0 |
| [Connectivity](#connectivity) | G-11 | 2 |
| [Errors & recovery](#errors--recovery) | G-12 | 1 |

### Review progress

| # | Group | IDs | Status |
|---|---|---|---|
| 1 | Module entry & navigation | G-01 – G-04 | **Complete** |
| 2 | Empty state | G-05 – G-08 | **Complete** |
| 3 | Pull-to-refresh & transient | G-09 – G-10 | **Complete** |
| 4 | Connectivity | G-11 | **Complete** |
| 5 | Errors & recovery | G-12 | **Complete** |

### Shared source registry

| Reg ID | Source | Owner | Classification | Affected surfaces |
|---|---|---|---|---|
| REG-G01 | `goals.title` | G1 | **Keep** | G-03, G-04 |
| REG-G02 | `goals.empty.linkAccounts` | G2 | **Revise** ✓ | G-07 |
| REG-G03 | `connectivity.offline.*` | Common | **Keep** | G-11 |
| REG-G04 | `goals.error` | G5 | **Implementation gap** ✓ | G-12 |

---

## Module boundary

**In scope:** Goals tab-root (`/goals`) and all copy rendered while the user is on the Goals tab.

**Current product state:** Pre-feature stub — the screen always renders the empty state. When the user has accounts, the CTA is hidden but title and body remain.

**Route map**

| Route | Screen |
|---|---|
| `/goals` | `GoalsScreen` |

**Out of scope:**

- `dashboard.widgets.goals.*` → Dashboard inventory (D-27)
- Accounts create flow (`/accounts/new`) → Accounts module
- Planning module (`/planning` — separate inventory)
- Future goal CRUD, progress, milestones, populated state

---

## Surface ID → file / component index

| ID | File / component |
|---|---|
| G-01, G-02 | `src/components/layout/tab-bar.tsx` |
| G-03 – G-08 | `src/components/screens/stub-tab-screens.tsx` → `GoalsScreen` |
| G-03, G-04 | `src/components/layout/stack-page-chrome.tsx` |
| G-05 – G-08 | `src/components/patterns/index.tsx` → `EmptyState` |
| G-09 | `src/components/layout/screen-header.tsx` → `PullToRefreshIndicator` |
| G-10 | `src/app/(app)/loading.tsx` |
| G-11 | `src/hooks/use-pull-to-refresh.ts` → `src/components/connectivity/connectivity-toasts.tsx` |
| G-12 | `src/components/screens/stub-tab-screens.tsx` → `GoalsScreen` |

---

### Module entry & navigation

| ID | Surface | Runtime | Reviewable | i18n / source | Visibility | Review status |
|---|---|---|---|---|---|---|
| G-01 | Tab bar — Goals label | Static i18n | Yes | `nav.goals` | Tab bar on `/goals` | **Deferred** → Navigation & IA |
| G-02 | Tab bar — nav landmark | Static i18n | Yes | `a11y.mainNavigation` | Tab bar on `/goals` | **Keep** |
| G-03 | Collapsed header title | Static i18n | Yes | REG-G01 | Always | **Keep** |
| G-04 | Large page title | Static i18n | Yes | REG-G01 | Always | **Keep** |

#### Group 1 outcome

| Status | Count | IDs |
|---|---|---|
| **Keep** | 3 | G-02 – G-04 |
| **Deferred** | 1 | G-01 |
| **Revise** | 0 | — |
| **Implementation gap** | 0 | — |
| **Foundation gap** | 0 | — |

### Empty state

| ID | Surface | Runtime | Reviewable | i18n / source | Visibility | Review status |
|---|---|---|---|---|---|---|
| G-05 | Empty state — title | Static i18n | Yes | `goals.empty.title` | Always | **Keep** |
| G-06 | Empty state — body | Static i18n | Yes | `goals.empty.body` | Always | **Keep** |
| G-07 | Empty state — CTA | Static i18n | Yes | REG-G02 | `!hasAccounts` only | **Revise** ✓ |
| G-08 | Empty state — icon | Non-verbal | No | `Target` (Lucide) | Always | — |

#### Group 2 outcome

| Status | Count | IDs |
|---|---|---|
| **Keep** | 2 | G-05, G-06 |
| **Revise** *(implemented)* | 1 | G-07 |
| **Deferred** | 0 | — |
| **Implementation gap** | 0 | — |
| **Foundation gap** | 0 | — |

**G-07 · `goals.empty.linkAccounts` — Implemented**

| | EN | AR |
|---|---|---|
| **Was** | Set up your accounts first | أعدّ حساباتك أولًا |
| **Now** | Start with your first account | ابدأ بحسابك الأول |
| **Foundation rationale** | Writing Patterns §5 — first-account CTA when routing to `/accounts/new`; propagates Planning P-07 / `accounts.empty.action` pattern |
| **Impact** | Pattern, Clarity |

### Pull-to-refresh & transient

| ID | Surface | Runtime | Reviewable | i18n / source | Visibility | Review status |
|---|---|---|---|---|---|---|
| G-09 | Pull-to-refresh indicator | Non-verbal | No | Animation | On pull / refresh | — |
| G-10 | App segment loading skeleton | Non-verbal | No | — | Route transition | — |

#### Group 3 outcome

Non-verbal only — no copy classification required.

### Connectivity

| ID | Surface | Runtime | Reviewable | i18n / source | Visibility | Review status |
|---|---|---|---|---|---|---|
| G-11 | Offline pull toast | Static i18n | Yes | REG-G03 | Offline pull attempt | **Keep** |

#### Group 4 outcome

| Status | Count | IDs |
|---|---|---|
| **Keep** | 1 | G-11 |

### Errors & recovery

| ID | Surface | Runtime | Reviewable | i18n / source | Visibility | Review status |
|---|---|---|---|---|---|---|
| G-12 | Finance refresh failure | Static i18n | Yes | REG-G04 | Failed `refresh` on Goals | **Implementation gap** ✓ |

#### Group 5 outcome

| Status | Count | IDs |
|---|---|---|
| **Implementation gap** *(resolved)* | 1 | G-12 |
| **Keep** | 0 | — |
| **Revise** | 0 | — |
| **Deferred** | 0 | — |
| **Foundation gap** | 0 | — |

**REG-G04 · `goals.error` — Implemented**

| | EN | AR |
|---|---|---|
| **Added** | Unable to refresh | تعذّر التحديث |
| **Wiring** | `GoalsScreen` surfaces `isFinanceLoadError` above empty state |
| **Foundation rationale** | Writing Patterns §7 — transient failure status; Planning P-10 parity for stub modules |
| **Impact** | Pattern, Clarity |

---

## Dormant i18n

| ID | Key | Notes |
|---|---|---|
| — | — | No dormant `goals.*` keys — all namespace keys are wired after review |

---

## Surfaces absent on Goals

| Surface type | Present |
|---|---|
| Detail / create / edit screens | No |
| Bottom sheets / dialogs | No |
| Pickers / confirmations | No |
| In-screen loading skeleton | No |
| Success toasts | No |
| Validation states | No |
| Populated / non-empty state | No *(stub only)* |
| Runtime-generated copy | No |

---

## Inventory completeness statement

Built from implementation inspection — not translation files alone.

**Routes inspected:** `src/app/(app)/goals/page.tsx` — confirmed no nested Goals routes.

**Components inspected:** `GoalsScreen`, shared tab shell, pull-to-refresh, connectivity toasts, `useFinance()` for CTA visibility and refresh.

**i18n traced:** `goals.title`, `goals.error`, `goals.empty.*`, `nav.goals`, `a11y.mainNavigation`, `connectivity.offline.*`.

**Conclusion:** All Goals routes and components inspected. Surfaces inventoried as **G-01 – G-12**. Dashboard goals widget (`dashboard.widgets.goals.*`) remains in Dashboard inventory.

---

## Summary

| Category | Count |
|---|---|
| Total surface IDs | **12** |
| Reviewable | **9** |
| Non-reviewable | **3** |
| Cross-module reviewable | **2** (G-02 Common, G-11 Connectivity; G-01 Navigation deferred) |
| Dormant i18n | **0** |
| Review groups | **5** *(complete)* |

---

## Module completion record

| Field | Value |
|---|---|
| **Module** | Goals |
| **Product maturity** | Stub |
| **Review date** | 2026-06-30 |
| **Inventory version** | 1.0 |
| **Final counts** | Keep **6** · Revise **1** (implemented) · Missing **0** · Implementation gap **1** (resolved) · Deferred **1** · Foundation gap **0** |
| **Deferred items** | G-01 → Navigation & IA |
| **Foundation changes introduced** | None |
| **Build / test status** | `npm test` — 354 passed · `npm run build` — succeeded |

*Stub maturity: no Missing items for future Goals functionality (goal entities, progress, populated state).*
