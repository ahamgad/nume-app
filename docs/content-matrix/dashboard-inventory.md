# Dashboard — surface inventory & review

**Module:** Dashboard  
**Route:** `/`  
**Primary component:** `src/components/screens/dashboard-screen.tsx`  
**Inventory:** Approved  
**Review:** Complete · **Implementation:** Complete

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
| D-01 | `src/components/layout/tab-bar.tsx` |
| D-02 | `src/components/layout/tab-bar.tsx` |
| D-03 | `src/components/screens/dashboard-screen.tsx` → `RootPageHeader` |
| D-04 | `src/components/screens/dashboard-screen.tsx` → `RootPageTitle` |
| D-05 | `src/components/screens/dashboard-screen.tsx` → `SetupBanner` |
| D-06 | `src/components/screens/dashboard-screen.tsx` → `SetupBanner` |
| D-07 | `src/components/screens/dashboard-screen.tsx` → `SetupBanner` |
| D-08 | `src/components/screens/dashboard-screen.tsx` → `Skeleton` |
| D-09 | `src/components/screens/dashboard-screen.tsx` → `MetricHero` |
| D-10 | `src/components/screens/dashboard-screen.tsx` → `ResponsiveCurrencyAmount` |
| D-11 | `src/components/screens/dashboard-screen.tsx` → `MetricHero` |
| D-12 | `src/components/screens/dashboard-screen.tsx` → `MetricHero` |
| D-13 | `src/lib/format/date.ts` → `formatRelativeTime` |
| D-14 | `src/lib/format/date.ts` → `formatRelativeTime` |
| D-15 | `src/lib/format/date.ts` → `formatDisplayDate` |
| D-16 | `src/components/screens/dashboard-screen.tsx` → `Button` |
| D-17 | `src/components/screens/dashboard-screen.tsx` → maturing-soon `WidgetCard` |
| D-18 | `src/components/screens/dashboard-screen.tsx` → maturing-soon row |
| D-19 | `src/components/screens/dashboard-screen.tsx` → maturing-soon row |
| D-20 | `src/components/screens/dashboard-screen.tsx` → `formatDisplayDate` |
| D-21 | `src/components/screens/dashboard-screen.tsx` → maturing-soon row |
| D-22 – D-24 | `src/components/screens/dashboard-screen.tsx` → `EducationalWidget` (financial health) |
| D-25 | `src/components/screens/dashboard-screen.tsx` → `EducationalWidget` (emergency fund) |
| D-26 | `src/components/screens/dashboard-screen.tsx` → `EducationalWidget` (cash flow) |
| D-27 | `src/components/screens/dashboard-screen.tsx` → `EducationalWidget` (goals) |
| D-28 | `src/components/screens/dashboard-screen.tsx` → activity `WidgetCard` |
| D-29 | `src/lib/finance/record-display.ts` → `formatRecordLabel` |
| D-30 | `src/lib/finance/record-display.ts` → `formatRecordSubline` |
| D-31 | `src/components/screens/dashboard-screen.tsx` → `formatDisplayDate` |
| D-32 | `src/components/screens/dashboard-screen.tsx` → `RecordRow` |
| D-33 | — (activity hidden when empty) |
| D-34 | `src/components/layout/screen-header.tsx` → `PullToRefreshIndicator` |
| D-35 | `src/hooks/use-pull-to-refresh.ts` → `connectivity-toasts.tsx` |
| D-36 | `src/lib/finance/store.tsx` → `refresh` |
| D-37 – D-40 | `src/lib/i18n/messages/en.ts` · `ar.ts` — dormant keys |

---

## Surfaces

### Entry & shell

| ID | Surface | Runtime | Owning module | i18n / source | Review status |
|---|---|---|---|---|---|
| D-01 | Tab bar — Dashboard label | Static i18n | Navigation | `nav.dashboard` | **Deferred** → Navigation & IA |
| D-02 | Tab bar — nav landmark | Static i18n | Common | `a11y.mainNavigation` | **Keep** |
| D-03 | Collapsed header title | Static i18n | Dashboard | `dashboard.title` | **Keep** |
| D-04 | Large page title | Static i18n | Dashboard | `dashboard.title` | **Keep** |

### Setup (no accounts)

| ID | Surface | Runtime | Owning module | i18n / source | Review status |
|---|---|---|---|---|---|
| D-05 | Setup banner — title | Static i18n | Dashboard | `dashboard.setup.title` | **Keep** |
| D-06 | Setup banner — description | Static i18n | Dashboard | `dashboard.setup.description` | **Revise** ✓ |
| D-07 | Setup banner — action | Static i18n | Dashboard | `dashboard.setup.action` | **Keep** |

### Net worth card

| ID | Surface | Runtime | Owning module | i18n / source | Review status |
|---|---|---|---|---|---|
| D-08 | Net worth loading | Non-verbal | — | `Skeleton` | — |
| D-09 | Metric label | Static i18n | Dashboard | `dashboard.netWorth.title` | **Keep** |
| D-10 | Metric amount | Formatted value | — | `ResponsiveCurrencyAmount` | — |
| D-11 | Assets · liabilities subline | Static i18n | Dashboard | `dashboard.netWorth.subline`, `.assets`, `.liabilities` | **Keep** |
| D-12 | Last updated meta | Generated copy | Dashboard | `dashboard.netWorth.updated` | **Keep** |
| D-13 | “Just now” | Generated copy | Dashboard | `dashboard.netWorth.justNow` | **Keep** |
| D-14 | Minutes / hours ago | Generated copy | Common | `common.time.minutesAgo`, `.hoursAgo` | **Keep** |
| D-15 | Older timestamp | Formatted value | — | `formatDisplayDate` | — |
| D-16 | Add account CTA | Static i18n | Dashboard | `dashboard.netWorth.addFirstAccount` | **Revise** ✓ |

### Certificates maturing soon

| ID | Surface | Runtime | Owning module | i18n / source | Review status |
|---|---|---|---|---|---|
| D-17 | Section title | Static i18n | Dashboard | `dashboard.certificates.maturingSoon.title` | **Keep** |
| D-18 | Certificate / account name | User content | — | `item.name` | — |
| D-19 | Auto-renewal badge | Static i18n | Dashboard | `dashboard.certificates.autoRenewalIndicator` | **Keep** |
| D-20 | Maturity date | Formatted value | — | `formatDisplayDate` | — |
| D-21 | Days remaining | Static i18n | Dashboard | `dashboard.certificates.maturingSoon.day`, `.days` | **Revise** ✓ |

### Educational widgets

| ID | Surface | Runtime | Owning module | i18n keys | Review status |
|---|---|---|---|---|---|
| D-22 | Financial health — title | Static i18n | Dashboard | `dashboard.widgets.financialHealth.title` | **Keep** |
| D-23 | Financial health — body | Static i18n | Dashboard | `dashboard.widgets.financialHealth.body` | **Revise** ✓ |
| D-24 | Financial health — hint | Static i18n | Dashboard | `dashboard.widgets.financialHealth.hint` | **Keep** |
| D-25 | Emergency fund — title / body / hint | Static i18n | Dashboard | `dashboard.widgets.emergencyFund.*` | **Keep** |
| D-26 | Cash flow — title / body / hint | Static i18n | Dashboard | `dashboard.widgets.cashFlow.*` | **Keep** |
| D-27 | Goals — title / body / hint | Static i18n | Dashboard | `dashboard.widgets.goals.*` | **Keep** |

### Recent activity

| ID | Surface | Runtime | Owning module | i18n / source | Review status |
|---|---|---|---|---|---|
| D-28 | Section title | Static i18n | Dashboard | `dashboard.activity.title` | **Keep** |
| D-29 | Row label *(generated path)* | Generated copy | Records | `formatRecordLabel` → `records.types.*`, `records.display.*` | **Keep** |
| D-30 | Row subline *(generated path)* | Generated copy | Records · Common | `formatRecordSubline` → `records.display.*`, `common.emptyValue` | **Keep** |
| D-31 | Row date | Formatted value | — | `formatDisplayDate` | — |
| D-32 | Row amount | Formatted value | — | `CurrencyAmount` | — |
| D-33 | Activity empty | — | — | Section hidden | — |

### Pull-to-refresh & errors

| ID | Surface | Runtime | Owning module | i18n / source | Review status |
|---|---|---|---|---|---|
| D-34 | Pull-to-refresh indicator | Non-verbal | — | Animation (`aria-hidden`) | — |
| D-35 | Offline pull toast | Static i18n | Connectivity | `connectivity.offline.title`, `.description` | **Keep** |
| D-36 | Finance refresh failure | — | Dashboard | `dashboard.netWorth.error` | **Implementation gap** ✓ |

### Dormant i18n

| ID | Key | Dormant class | Review status |
|---|---|---|---|
| D-37 | `dashboard.netWorth.error` | Dead candidate | **Keep** ✓ *(wired via D-36)* |
| D-38 | `dashboard.certificates.upcomingInterest.title` | Reserved | **Deferred** → future Dashboard widget |
| D-39 | `dashboard.certificates.upcomingInterest.date` | Reserved | **Deferred** → future Dashboard widget |
| D-40 | `dashboard.activity.recordMeta` | Dead candidate | **Deferred** → i18n cleanup pass |

---

## Review outcome summary

| Status | Count | IDs |
|---|---|---|
| **Keep** | 23 | D-02 – D-05, D-07, D-09, D-11 – D-14, D-17, D-19, D-22, D-24 – D-30, D-35, D-37 |
| **Revise** *(implemented)* | 4 | D-06, D-16, D-21, D-23 |
| **Implementation gap** *(resolved)* | 1 | D-36 |
| **Deferred** | 4 | D-01, D-38, D-39, D-40 |
| **Missing** | 0 | — |
| **Foundation gap** | 0 | — |
| Non-reviewable | 8 | D-08, D-10, D-15, D-18, D-20, D-31, D-32, D-34 |
| No copy (hidden) | 1 | D-33 |

---

## Revisions

### D-05 · `dashboard.setup.title` — **Keep**

| | |
|---|---|
| **Decision** | Keep **Add your first account** / **أضف حسابك الأول** |
| **Foundation rationale** | Voice & Tone — Directness; rejected marketing-style alternative. Duplication with net worth CTA resolved via **D-16** (Writing Patterns §1 action labels — shortened label when banner supplies context) |

### D-06 · `dashboard.setup.description` — **Implemented**

| | EN | AR |
|---|---|---|
| **Was** | Track your wealth starting here | ابدأ تتبع ثروتك من هنا |
| **Now** | Add an account you use every day to see your net worth here | أضف حسابًا تستخدمه يوميًا لترى صافي ثروتك هنا |
| **Foundation rationale** | Writing Patterns §5 (empty states) — same intent as Accounts first-account guidance, Dashboard-specific context; Product Terminology — Net worth |
| **Impact** | Pattern, Terminology, Clarity |

### D-16 · `dashboard.netWorth.addFirstAccount` — **Implemented**

| | EN | AR |
|---|---|---|
| **Was** | Add your first account | أضف حسابك الأول |
| **Now** | Add account | إضافة حساب |
| **Foundation rationale** | Writing Patterns §1 — shortened action label when setup banner already states first-account intent; Product Terminology — Add |
| **Impact** | Pattern, Terminology |

### D-21 · `dashboard.certificates.maturingSoon.day` / `.days` — **Implemented**

| | EN | AR |
|---|---|---|
| **Was** | `{count} days` only | `{count} يومًا` only |
| **Now** | `1 day` / `{count} days` | `يوم واحد` / `{count} يومًا` |
| **Foundation rationale** | Content Principles §1 — Clarity; Localization Guidelines §2 — correct count grammar |
| **Impact** | Clarity, Localization |

### D-23 · `dashboard.widgets.financialHealth.body` — **Implemented**

| | EN | AR |
|---|---|---|
| **Was** | A simple **score** based on… / **مؤشر** بسيط… |
| **Now** | A simple **view** of… / **نظرة** بسيطة على… |
| **Foundation rationale** | Voice & Tone — Precision; Content Principles §1 — feature not yet available (hint confirms) |
| **Impact** | Voice, Clarity |

---

## Implementation gap

### D-36 · Finance load / refresh failure — **Resolved**

| | |
|---|---|
| **Fix** | `isFinanceLoadError` in finance store; `dashboard.netWorth.error` shown in net worth card |
| **Foundation rationale** | Writing Patterns §3 — Feedback messages; Writing Patterns §7 — Transient states |
| **Impact** | Pattern, Clarity |

---

## Deferred items

| ID | Item | Target pass |
|---|---|---|
| D-01 | `nav.dashboard` tab label | Navigation & IA module |
| D-38 – D-39 | Upcoming interest widget copy | Future feature implementation |
| D-40 | `dashboard.activity.recordMeta` removal | i18n cleanup pass |

---

## Completeness statement

All Dashboard routes, rendered components, formatters, and i18n references were inspected. **40** surface IDs inventoried. Every reviewable surface has a final review status. No **Foundation gap** items. No follow-up discovery passes required for this module.

**Next step:** Dashboard module complete. Proceed to **Planning** preparation.

---

## Module completion record

| Field | Value |
|---|---|
| **Module** | Dashboard |
| **Review date** | 2026-06-30 |
| **Inventory version** | 1.0 |
| **Final counts** | Keep **23** · Revise **4** (implemented) · Missing **0** · Implementation gap **1** (resolved) · Deferred **4** · Foundation gap **0** |
| **Deferred items** | D-01 → Navigation & IA · D-38 – D-39 → upcoming interest widget · D-40 → i18n cleanup |
| **Foundation changes introduced** | None |
| **Build / test status** | `npm test` — 354 passed · `npm run build` — succeeded |
