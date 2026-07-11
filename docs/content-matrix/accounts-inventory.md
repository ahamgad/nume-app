# Accounts — surface inventory

**Module:** Accounts  
**Routes:** `/accounts` and nested `/accounts/**`  
**Primary components:** `accounts-list-screen.tsx`, type-specific details/create/edit screens, account form foundations  
**Product maturity:** Complete  
**Inventory version:** 1.0  
**Status:** Review complete · **13 of 13 groups**

### Module review rules (locked during Accounts review)

1. **Recovery action labels** — describe destination or action; never reuse a screen title (`accounts.navigation.backToList` pattern).
2. **Pattern propagation** — when a pattern is found, search the whole module during that group's review; note cross-group items in the inventory.
3. **Shared copy** — review identical i18n keys, generated strings, or shared components once at the source; propagate classification to all affected surfaces.
4. **Review priority** — unique copy first, then unreviewed shared sources, then Revise/Deferred sources, then propagate approved shared sources without full re-review unless source, context, or applicable Foundation changed.
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

Surfaces are grouped by user journey. Classification is **per surface** (per ID), not per group.

| Group | IDs | Reviewable |
|---|---|---|
| [Module entry & navigation](#module-entry--navigation) | A-01 – A-08 | 6 |
| [Accounts list](#accounts-list) | A-09 – A-20 | 8 |
| [Account details](#account-details) | A-21 – A-88 | 52 |
| [Records & activity](#records--activity) | A-89 – A-108 | 18 |
| [Create account](#create-account) | A-109 – A-158 | 46 |
| [Edit account](#edit-account) | A-159 – A-166 | 7 |
| [Account-specific bottom sheets](#account-specific-bottom-sheets) | A-167 – A-172 | 6 |
| [Pickers](#pickers) | A-173 – A-182 | 9 |
| [Confirmations](#confirmations) | A-183 – A-185 | 3 |
| [Empty states](#empty-states) | A-186 – A-189 | 4 |
| [Loading & transient states](#loading--transient-states) | A-190 – A-196 | 4 |
| [Errors & validation](#errors--validation) | A-197 – A-218 | 20 |
| [Success states](#success-states) | A-219 – A-236 | 18 |

*Group **Records & activity** added for add-record and credit-card activity routes — a large sub-journey within Accounts not covered by the user's template list alone.*

### Review progress

| # | Group | IDs | Status |
|---|---|---|---|
| 1 | Module entry & navigation | A-01 – A-08 | **Complete** |
| 2 | Accounts list | A-09 – A-20 | **Complete** |
| 3 | Account details | A-21 – A-88 | **Complete** |
| 4 | Records & activity | A-89 – A-108 | **Complete** |
| 5 | Create account | A-109 – A-158 | **Complete** |
| 6 | Edit account | A-159 – A-166 | **Complete** |
| 7 | Account-specific bottom sheets | A-167 – A-172 | **Complete** |
| 8 | Pickers | A-173 – A-182 | **Complete** |
| 9 | Confirmations | A-183 – A-185 | **Complete** |
| 10 | Empty states | A-186 – A-189 | **Complete** |
| 11 | Loading & transient states | A-190 – A-196 | **Complete** |
| 12 | Errors & validation | A-197 – A-218 | **Complete** |
| 13 | Success states | A-219 – A-236 | **Complete** |

### Shared source registry

Authoritative decision history for shared copy. Later groups reference **Reg ID** — do not repeat rationale unless the source is reopened.

| Reg ID | Source | Owner | Classification | Affected surfaces (all groups) |
|---|---|---|---|---|
| REG-01 | `accounts.navigation.backToList` | G1 | **Revise** ✓ | A-07, A-48 |
| REG-02 | `accounts.types.*` | G2 | **Revise** ✓ *(AR loan)* | A-17, A-19, A-23, A-24, A-111, A-113, A-150 |
| REG-03 | `accounts.sections.*`, `accounts.typeGroups.investments` | G2 | **Keep** | A-12 – A-15, A-110 |
| REG-04 | `accounts.add.typeUnavailable` | G1 | **Keep** *(invalid create route)* | A-06 |
| REG-05 | `records.add.unsupportedAccountType` | G4 | **Missing** ✓ | A-92 |
| REG-06 | `records.add.adjustment.title` | G4 | **Revise** ✓ | A-93, A-108 |
| REG-07 | `creditCards.purchase.submit` / `.saving`, `payment.submit` / `.saving` | G4 | **Implementation gap** ✓ | Purchase & payment screens |
| REG-08 | `formatAccountDetailsHeaderSubtitle` | G3 | **Keep** *(REG-02)* | A-23 |
| REG-09 | `accounts.details.notFound*` / `certificates.details.notFound*` | G3 | **Keep** | A-46, A-47 |
| REG-10 | `accounts.add.lead` | G5 | **Keep** | A-115 *(standard create)* |
| REG-11 | `accounts.add.firstAccount.lead` | G5 | **Implementation gap** ✓ | A-115 *(first-account flow)* |
| REG-12 | `accounts.add.certificateLead` | G5 | **Implementation gap** ✓ | A-115 *(certificate create)* |
| REG-13 | `accounts.add.firstAccount.title`, `.cta` | G5 | **Keep** | A-114, A-118 |
| REG-14 | `accounts.add.chooseType`, `.comingSoon`, `.createTitle` | G5 | **Keep** | A-109, A-112, A-113, A-171 |
| REG-15 | `accounts.createAccount`, `accounts.create.submitting` | G5 | **Keep** | A-116, A-117 |
| REG-16 | `accounts.formSections.*`, `accounts.fields.*` | G5 | **Keep** | A-119 – A-125, A-165 |
| REG-17 | `accounts.fields.annualRate.label` | G3 | **Keep** | A-128, A-51 |
| REG-18 | `savings.sections.*`, `savings.fields.*`, `savings.interestModel.*`, `savings.destination.*`, `savings.postingFrequency.*` | G5 | **Keep** | A-127 – A-134 |
| REG-19 | `certificates.fields.*`, `certificates.payoutFrequency.*`, `certificates.renewalType.*`, `certificates.fields.term.*` | G5 | **Keep** | A-135 – A-143, A-155 |
| REG-20 | `creditCards.fields.*`, `creditCards.formSections.statement` | G5 | **Keep** / **Revise** ✓ *(REG-21)* | A-144 – A-148 |
| REG-21 | `creditCards.fields.outstandingBalance.label` | G5 | **Revise** ✓ | A-144 |
| REG-22 | `businessDays.*` | G5 | **Keep** | A-132 |
| REG-23 | `formatAccountDestinationDisplay` | G3 | **Keep** | A-58, A-152 |
| REG-24 | `common.currency.zeroPlaceholder`, `common.currency.code` | Common | **Keep** | A-126, A-28 |
| REG-25 | `common.emptyValue` | Common | **Keep** | A-156 |
| REG-26 | `institutions.*` | G8 | **Deferred** *(catalog)* | A-175, A-151 |
| REG-27 | `records.display.*` / `formatRecordSubline` | G4 | **Keep** | A-153 *(misassigned to G5 — see outcome)* |
| REG-28 | `accounts.edit.createTitle` + `getEditAccountScreenTitle` | G6 | **Implementation gap** ✓ | A-159 |
| REG-29 | `fieldEditor.confirm` | G6 | **Implementation gap** ✓ | A-166, A-172 |
| REG-30 | `AccountActionPickerCard` + `PickerBottomSheet` | G7 | **Keep** *(pattern)* | A-167 – A-170 |
| REG-31 | `accounts.refreshError` + `FinanceRefreshErrorNotice` | G11 | **Implementation gap** ✓ | A-196, A-217, A-218 |
| REG-32 | Validation phrasing (`*.validation.*` — Enter/Select pattern) | G12 | **Revise** ✓ | A-197, A-198, A-200, A-207, A-209 |

---

## Module boundary

**In scope:** All routes under `src/app/(app)/accounts/**`, components rendered from those routes, and account-related sheets/pickers opened from Accounts journeys.

**Route map**

| Route | Screen |
|---|---|
| `/accounts` | `AccountsListScreen` |
| `/accounts/new` | `AddAccountScreen` → `AddMoneyAccountScreen` (first-account) |
| `/accounts/new/[type]` | `AddAccountTypeRouterScreen` → type create screens |
| `/accounts/[id]` | `AccountDetailsScreen` → type-specific details |
| `/accounts/[id]/edit` | `EditAccountRouterScreen` → type edit screens |
| `/accounts/[id]/records` | `AccountRecordsHistoryScreen` |
| `/accounts/[id]/records/new` | `AddRecordTypeScreen` |
| `/accounts/[id]/records/new/[type]` | `AddRecordFormScreen` |
| `/accounts/[id]/activity/new` | `AddCreditCardActivityScreen` |
| `/accounts/[id]/activity/new/purchase` | `AddCreditCardPurchaseScreen` |
| `/accounts/[id]/activity/new/payment` | `AddCreditCardPaymentScreen` |

**Out of scope**

- Tab labels for non-Accounts modules → respective module inventories
- `common.*`, `picker.none`, `connectivity.*`, `a11y.*` when shared across modules — inventoried here when surfaced on Accounts routes; owning module noted
- Dashboard references to accounts → Dashboard inventory
- Institution catalog maintenance tooling (keys are reviewable as one bundled surface)

---

## Surfaces

### Module entry & navigation

| ID | Surface | Runtime | Reviewable | i18n / source | Visibility | Review status |
|---|---|---|---|---|---|---|
| A-01 | Tab bar — Accounts label | Static i18n | Yes | `nav.accounts` | Tab bar | **Deferred** → Navigation & IA |
| A-02 | Tab bar — nav landmark | Static i18n | Yes | `a11y.mainNavigation` | Tab bar | **Keep** |
| A-03 | List — page title (header + in-content) | Static i18n | Yes | `accounts.title` | `/accounts` | **Keep** |
| A-04 | List — header Add account action | Static i18n | Yes | `accounts.headerActions.addAccount` | Finance ready | **Keep** |
| A-05 | Stack — back control | Non-verbal | No | Chevron | Stack routes | — |
| A-06 | Create — invalid account type message | Static i18n | Yes | `accounts.add.typeUnavailable` | Unknown `/accounts/new/[type]` | **Keep** |
| A-07 | Create — return to list CTA (invalid type) | Static i18n | Yes | `accounts.navigation.backToList` | Unknown type | **Revise** ✓ |
| A-08 | Discard changes dialog | Static i18n | Yes | `common.discardChanges.*` | Dirty create/edit/record forms | **Keep** |

#### Group 1 outcome

| Status | Count | IDs |
|---|---|---|
| **Keep** | 5 | A-02 – A-04, A-06, A-08 |
| **Revise** *(implemented)* | 1 | A-07 |
| **Deferred** | 1 | A-01 |
| **Missing** | 0 | — |
| **Implementation gap** | 0 | — |
| **Foundation gap** | 0 | — |

**A-07 · `accounts.navigation.backToList` — Implemented**

| | EN | AR |
|---|---|---|
| **Was** | `accounts.title` — Accounts | الحسابات |
| **Now** | Back to accounts | العودة إلى الحسابات |
| **Foundation rationale** | Writing Patterns §1 (action labels) — navigation CTA names the action, not the destination screen title; parallel to `auth.verify.backToLogin` |
| **Impact** | Pattern, Clarity |

### Accounts list

| ID | Surface | Runtime | Reviewable | i18n / source | Visibility | Review status |
|---|---|---|---|---|---|---|
| A-09 | Filter chip — Active | Static i18n | Yes | `accounts.filters.active` | Has accounts | **Keep** |
| A-10 | Filter chip — Archived | Static i18n | Yes | `accounts.filters.archived` | Has accounts | **Keep** |
| A-11 | Filter group aria label | Static i18n | Yes | `accounts.filters.label` | Has accounts | **Keep** |
| A-12 | Section heading — Money | Static i18n | Yes | `accounts.sections.money` | Section non-empty | **Keep** |
| A-13 | Section heading — Savings | Static i18n | Yes | `accounts.sections.savings` | Section non-empty | **Keep** |
| A-14 | Section heading — Certificates | Static i18n | Yes | `accounts.sections.certificates` | Section non-empty | **Keep** |
| A-15 | Section heading — Liabilities | Static i18n | Yes | `accounts.sections.liabilities` | Section non-empty | **Keep** |
| A-16 | Account card — name | User content | No | `account.name` | Per card | — |
| A-17 | Account card — type · last-4 | Generated copy | Yes | `accounts.types.*` + last-4 | Per card | **Revise** ✓ |
| A-18 | Account card — balance | Formatted value | No | `CurrencyAmount` | Per card | — |
| A-19 | Account card — logo fallback initial | Generated copy | Yes | `accounts.types.*` / institution name | No brand asset | **Revise** ✓ |
| A-20 | Account card chevron | Non-verbal | No | — | Per card | — |

#### Group 2 outcome

| Status | Count | IDs |
|---|---|---|
| **Keep** | 6 | A-09 – A-15 |
| **Revise** *(implemented)* | 2 | A-17, A-19 |
| **Missing** | 0 | — |
| **Implementation gap** | 0 | — |
| **Deferred** | 0 | — |
| **Foundation gap** | 0 | — |

**Pattern propagation audit:** No recovery CTAs in this group. `accounts.sections.*` also appears in type picker (A-110 — Group 7). `formatAccountCardInstituteRow` also powers picker subtitles (A-178 — Group 8) — inherits `accounts.types.*` fix.

**A-17 / A-19 · `accounts.types.loan` (AR) — Implemented**

| | EN | AR |
|---|---|---|
| **Was** | Loan | قروض |
| **Now** | Loan | قرض |
| **Foundation rationale** | Product Terminology — Loan (قرض); Localization Guidelines — approved Arabic terminology mandatory |
| **Impact** | Terminology, Localization |

*Surfaces A-17 and A-19 share `accounts.types.*` via `getAccountTypeCardLabelKey` — one key fix covers both. English card type labels already use shortened forms per Writing Patterns global rule 3 (Current, Savings, Credit, etc.).*

### Account details

*Shared chrome across money, savings, credit card, and certificate detail screens.*

#### Shared sources (Group 3)

Reviewed once at source; classifications propagate to listed surfaces.

| Source | Keys / component | Decision | Affected surfaces |
|---|---|---|---|
| G3-S-01 | `formatAccountDetailsHeaderSubtitle` → `accounts.types.*` | **Keep** *(Group 2)* | A-23 |
| G3-S-02 | `getAccountTypeInitial` → `accounts.types.*` | **Keep** *(Group 2)* | A-24 |
| G3-S-03 | `dashboard.netWorth.updated` + `formatRelativeTime` + `common.time.*` | **Keep** *(Dashboard D-12 – D-14)* | A-26, A-27 |
| G3-S-04 | `common.currency.zeroPlaceholder`, `common.sign.*` | **Keep** *(Common)* | A-28, A-29 |
| G3-S-05 | `accounts.headerActions.addRecord` / `.addActivity` | **Keep** | A-30, A-31 |
| G3-S-06 | `accounts.details.records.title` / `.viewAll` | **Keep** | A-32, A-33 |
| G3-S-07 | `formatRecordLabel` / `formatRecordSubline` | **Keep** *(Records / Dashboard D-29 – D-30)* | A-34, A-35, A-88 |
| G3-S-08 | Settings & archived actions (`settingsTitle`, `edit.title`, archive, toggles, restore, delete) | **Keep** | A-38 – A-45 |
| G3-S-09 | `accounts.details.notFound` / `.notFoundDescription` | **Keep** | A-46, A-47 *(money, savings, CC, history, edit routers)* |
| G3-S-10 | `certificates.details.notFound` / `.notFoundDescription` | **Keep** | A-46, A-47 *(certificate)* |
| G3-S-11 | `accounts.navigation.backToList` | **Revise** ✓ | A-48 *(with A-07 Group 1)* |
| G3-S-12 | `formatCertificateRemainingLabel` → `certificates.details.remaining*Count` | **Keep** *(Dashboard D-21 pattern)* | A-77 |
| G3-S-13 | `formatAccountDestinationDisplay` | **Keep** | A-58, A-63, A-81 |
| G3-S-14 | `accounts.details.currentBalance` | **Keep** *(Terminology — Current balance)* | A-25 |
| G3-S-15 | `accounts.fields.annualRate.label` | **Keep** *(shared field key)* | A-51 |
| G3-S-16 | `accounts.fields.interestDestination.label` | **Keep** *(Terminology — Interest destination)* | A-56 |
| G3-S-17 | `savings.details.*`, `savings.interestModel.*`, `savings.destination.sameAccount` | **Keep** | A-49 – A-52, A-54, A-57 |
| G3-S-18 | `creditCards.details.*`, related field labels | **Keep** | A-59 – A-62, A-64, A-66, A-68 |
| G3-S-19 | `formatPostingDayLabel`, `savings.fields.postingDay.lastOfMonth` | **Keep** | A-69 |
| G3-S-20 | `certificates.details.*`, `certificates.fields.principal`, payout / renewal keys | **Keep** | A-70 – A-83 |
| G3-S-21 | `accounts.recordsHistory.filters.*` | **Keep** | A-85 – A-87 |
| G3-S-22 | `common.currency.code`, `common.emptyValue` | **Keep** *(Common)* | A-60; values A-63, A-67, A-55 |

| ID | Surface | Runtime | Reviewable | i18n / source | Visibility | Review status |
|---|---|---|---|---|---|---|
| A-21 | Stack header title | User content | No | `account.name` | Details | — |
| A-22 | Hero — account name | User content | No | `account.name` | Details | — |
| A-23 | Hero — subtitle (type · last-4) | Generated copy | Yes | G3-S-01 | When identifier exists | **Keep** |
| A-24 | Hero — type initial fallback | Generated copy | Yes | G3-S-02 | No institution brand | **Keep** |
| A-25 | Balance label — Current balance | Static i18n | Yes | G3-S-14 | Money/savings | **Keep** |
| A-26 | Balance meta — Updated {time} | Generated copy | Yes | G3-S-03 | When `updatedAt` | **Keep** |
| A-27 | Relative time — just now / minutes / hours | Generated copy | Yes | G3-S-03 | Balance meta | **Keep** |
| A-28 | Quick-balance editor placeholder | Static i18n | Yes | G3-S-04 | Editable balance | **Keep** |
| A-29 | Quick-balance sign toggle | Static i18n | Yes | G3-S-04 | Signed balance edit | **Keep** |
| A-30 | Header — Add record | Static i18n | Yes | G3-S-05 | Active money/savings | **Keep** |
| A-31 | Header — Add activity | Static i18n | Yes | G3-S-05 | Active credit card | **Keep** |
| A-32 | Recent records — section title | Static i18n | Yes | G3-S-06 | Details | **Keep** |
| A-33 | Recent records — View all | Static i18n | Yes | G3-S-06 | `totalRecordCount > limit` | **Keep** |
| A-34 | Record row — label | Generated copy | Yes | G3-S-07 | Per record | **Keep** |
| A-35 | Record row — subline | Generated copy | Yes | G3-S-07 | Per record | **Keep** |
| A-36 | Record row — date | Formatted value | No | `formatDisplayDate` | Per record | — |
| A-37 | Record row — amount | Formatted value | No | `CurrencyAmount` | Per record | — |
| A-38 | Settings — section title | Static i18n | Yes | G3-S-08 | Active | **Keep** |
| A-39 | Settings — Edit account row | Static i18n | Yes | G3-S-08 | Active | **Keep** |
| A-40 | Settings — Archive account | Static i18n | Yes | G3-S-08 | Active (cert: `certificates.details.archive`) | **Keep** |
| A-41 | Toggle — Include in net worth | Static i18n | Yes | G3-S-08 | Active money/savings/cert | **Keep** |
| A-42 | Toggle — Include in emergency fund | Static i18n | Yes | G3-S-08 | Active money/savings/cert | **Keep** |
| A-43 | Archived — Restore account | Static i18n | Yes | G3-S-08 | Archived | **Keep** |
| A-44 | Archived — Restore loading | Static i18n | Yes | G3-S-08 | During restore | **Keep** |
| A-45 | Archived — Permanently delete | Static i18n | Yes | G3-S-08 | Archived | **Keep** |
| A-46 | Not found — title | Static i18n | Yes | G3-S-09 / G3-S-10 | Missing account | **Keep** |
| A-47 | Not found — description | Static i18n | Yes | G3-S-09 / G3-S-10 | Missing account | **Keep** |
| A-48 | Not found — return CTA | Static i18n | Yes | G3-S-11 | Money + certificate not-found screens | **Revise** ✓ |

**Savings details** (`savings-details-screen.tsx`)

| ID | Surface | Runtime | Reviewable | i18n / source | Visibility | Review status |
|---|---|---|---|---|---|---|
| A-49 | Summary section title | Static i18n | Yes | G3-S-17 | Savings details | **Keep** |
| A-50 | Interest model row | Static i18n | Yes | G3-S-17 | Savings details | **Keep** |
| A-51 | Annual rate row label | Static i18n | Yes | G3-S-15 | Savings details | **Keep** |
| A-52 | Annual rate — below tier | Static i18n | Yes | G3-S-17 | Balance below minimum tier | **Keep** |
| A-53 | Annual rate — numeric value | Formatted value | No | `{rate}%` | Valid rate | — |
| A-54 | Next posting row | Static i18n | Yes | G3-S-17 | Savings details | **Keep** |
| A-55 | Next posting date value | Formatted value | No | G3-S-22 | Per savings account | — |
| A-56 | Interest destination row label | Static i18n | Yes | G3-S-16 | Savings details | **Keep** |
| A-57 | Destination — Same account | Static i18n | Yes | G3-S-17 | `same_account` | **Keep** |
| A-58 | Destination — other account | Generated copy | Yes | G3-S-13 | Another account selected | **Keep** |

**Credit card details** (`credit-card-details-screen.tsx`)

| ID | Surface | Runtime | Reviewable | i18n / source | Visibility | Review status |
|---|---|---|---|---|---|---|
| A-59 | Outstanding balance label | Static i18n | Yes | G3-S-18 | Credit card details | **Keep** |
| A-60 | Outstanding balance EGP affix | Static i18n | Yes | G3-S-22 | Inline edit | **Keep** |
| A-61 | Summary section title | Static i18n | Yes | G3-S-18 | Credit card details | **Keep** |
| A-62 | Linked account row | Static i18n | Yes | G3-S-18 | Credit card details | **Keep** |
| A-63 | Linked account value | Generated copy | Yes | G3-S-13 / G3-S-22 | Per card | **Keep** |
| A-64 | Credit limit row | Static i18n | Yes | G3-S-18 | Credit card details | **Keep** |
| A-65 | Credit limit value | Formatted value | No | `formatCurrency` | Per card | — |
| A-66 | Available to spend row | Static i18n | Yes | G3-S-18 | Credit card details | **Keep** |
| A-67 | Available to spend value | Formatted value | No | G3-S-22 | Computed | — |
| A-68 | Statement due date row | Static i18n | Yes | G3-S-18 | Credit card details | **Keep** |
| A-69 | Statement due date value | Generated copy | Yes | G3-S-19 | Per card config | **Keep** |

**Certificate details** (`certificate-details-screen.tsx`)

| ID | Surface | Runtime | Reviewable | i18n / source | Visibility | Review status |
|---|---|---|---|---|---|---|
| A-70 | Principal balance label | Static i18n | Yes | G3-S-20 | Certificate details | **Keep** |
| A-71 | Process interest CTA | Static i18n | Yes | G3-S-20 | Active + due entries | **Keep** |
| A-72 | Process interest loading | Static i18n | Yes | G3-S-20 | During processing | **Keep** |
| A-73 | Summary section title | Static i18n | Yes | G3-S-20 | Certificate details | **Keep** |
| A-74 | Purchase date row | Static i18n | Yes | G3-S-20 | Certificate details | **Keep** |
| A-75 | Maturity date row | Static i18n | Yes | G3-S-20 | Certificate details | **Keep** |
| A-76 | Remaining row label | Static i18n | Yes | G3-S-20 | Certificate details | **Keep** |
| A-77 | Remaining value | Generated copy | Yes | G3-S-12 | Computed | **Keep** |
| A-78 | Payout frequency row | Static i18n | Yes | G3-S-20 | Certificate details | **Keep** |
| A-79 | Payout frequency value | Static i18n | Yes | G3-S-20 | Per certificate | **Keep** |
| A-80 | Interest destination — not selected | Static i18n | Yes | G3-S-20 | No destination | **Keep** |
| A-81 | Interest destination — account | Generated copy | Yes | G3-S-13 | Destination set | **Keep** |
| A-82 | Renewal row label | Static i18n | Yes | G3-S-20 | Certificate details | **Keep** |
| A-83 | Renewal value Yes / No | Static i18n | Yes | G3-S-20 | Per renewal type | **Keep** |
| A-84 | Annual rate on details | Formatted value | No | `{rate}%` | Certificate details | — |

**Records history** (`account-records-history-screen.tsx`)

| ID | Surface | Runtime | Reviewable | i18n / source | Visibility | Review status |
|---|---|---|---|---|---|---|
| A-85 | Period filter — This month | Static i18n | Yes | G3-S-21 | History screen | **Keep** |
| A-86 | Period filter — Last month | Static i18n | Yes | G3-S-21 | History screen | **Keep** |
| A-87 | Period filter aria label | Static i18n | Yes | G3-S-21 | History screen | **Keep** |
| A-88 | Record rows (label / subline / date / amount) | — | — | G3-S-07; A-36 – A-37 | History list | **Keep** *(propagated)* |

#### Group 3 outcome

| Status | Count | IDs |
|---|---|---|
| **Keep** | 57 | A-23 – A-47, A-49 – A-52, A-54, A-56 – A-83, A-85 – A-88 |
| **Revise** *(implemented)* | 1 | A-48 |
| **Missing** | 0 | — |
| **Implementation gap** | 0 | — |
| **Deferred** | 0 | — |
| **Foundation gap** | 0 | — |

**A-48 · Not-found return CTA — Implemented**

| | |
|---|---|
| **Was** | `accounts.title` on money-router and certificate not-found screens |
| **Now** | `accounts.navigation.backToList` — wired in `account-details-screen.tsx`, `certificate-details-screen.tsx` |
| **Foundation rationale** | Writing Patterns §1 (action labels) — recovery CTA names the action; Module review rule 1 (recovery action labels) |
| **Impact** | Pattern, Clarity |

*Pattern propagation: searched module for `accounts.title` as button — only not-found CTAs affected; list titles (A-03) remain correct screen titles. Savings / credit-card not-found screens have no list CTA (back chevron only) — surface-specific, no change.*

*Deferred note: `notFoundDescription` trailing-period inconsistency (account AR, certificate EN/AR) → editorial cleanup pass.*

### Records & activity

#### Shared sources (Group 4)

| Source | Prior. | Decision | Affected surfaces |
|---|---|---|---|
| G4-S-01 | 1 | **Keep** | `records.add.title` → A-89, A-167 |
| G4-S-02 | 1 | **Keep** | `records.types.*` + `records.add.{type}.description` → A-90, A-168 *(sheet: types only)* |
| G4-S-03 | 1 | **Missing** ✓ + **Implementation gap** ✓ | `records.add.unsupportedAccountType` → A-92 *(reopened G1-S `typeUnavailable` — context changes meaning)* |
| G4-S-04 | 1 | **Keep** | `records.add.{income,expense,transfer}.title` → A-93 |
| G4-S-05 | 1 | **Revise** ✓ | `records.add.adjustment.title` → A-93, A-108 |
| G4-S-06 | 1 | **Keep** | `records.formSections.details`, `records.fields.*`, `records.preview.*` → A-94 – A-99 |
| G4-S-07 | 4 | **Keep** *(Common)* | `common.save`, `records.add.saving` → A-100 *(record forms only)* |
| G4-S-08 | 1 | **Keep** | `creditCards.activity.*` → A-101, A-102, A-169, A-170 |
| G4-S-09 | 1 | **Keep** | `creditCards.purchase.title`, `.descriptionPlaceholder` → A-103, A-104 |
| G4-S-10 | 1 | **Keep** | `creditCards.payment.title`, `.descriptionPlaceholder` → A-105, A-107 |
| G4-S-11 | 1 | **Implementation gap** ✓ | `creditCards.purchase.submit` / `.saving`, `creditCards.payment.submit` / `.saving` → purchase & payment screens |
| G4-S-12 | 4 | **Keep** *(G4-S-06)* | `records.fields.transfer.*` → A-98, A-106 |

| ID | Surface | Runtime | Reviewable | i18n / source | Visibility | Review status |
|---|---|---|---|---|---|---|
| A-89 | Add record type — screen title | Static i18n | Yes | G4-S-01 | `/records/new` | **Keep** |
| A-90 | Record type options — title + description | Static i18n | Yes | G4-S-02 | Valid account types | **Keep** |
| A-91 | Record type — context account name | User content | No | `account.name` | When account exists | — |
| A-92 | Unsupported record types message | Static i18n | Yes | G4-S-03 | CC / certificate accounts | **Implementation gap** ✓ |
| A-93 | Add record form — screen title | Static i18n | Yes | G4-S-04 / G4-S-05 | Per type route | **Keep** / **Revise** ✓ *(adjustment)* |
| A-94 | Record form — Details section | Static i18n | Yes | G4-S-06 | Record forms | **Keep** |
| A-95 | Record form — amount / correct balance label | Static i18n | Yes | G4-S-06 | Per type | **Keep** |
| A-96 | Record form — description / reason | Static i18n | Yes | G4-S-06 | Per type | **Keep** |
| A-97 | Record form — date field | Static i18n | Yes | G4-S-06 | Record forms | **Keep** |
| A-98 | Transfer — from / to account pickers | Static i18n | Yes | G4-S-12 | Transfer type | **Keep** |
| A-99 | Adjustment — balance preview labels | Static i18n | Yes | G4-S-06 | Adjustment type | **Keep** |
| A-100 | Record form — save CTA / saving | Static i18n | Yes | G4-S-07 | Record forms | **Keep** |
| A-101 | Add activity — screen title | Static i18n | Yes | G4-S-08 | CC activity hub | **Keep** |
| A-102 | Activity option cards | Static i18n | Yes | G4-S-08 | CC activity hub | **Keep** |
| A-103 | Add purchase — screen title | Static i18n | Yes | G4-S-09 | Purchase route | **Keep** |
| A-104 | Purchase — description placeholder | Static i18n | Yes | G4-S-09 | Purchase form | **Keep** |
| A-105 | Add payment — screen title | Static i18n | Yes | G4-S-10 | Payment route | **Keep** |
| A-106 | Payment — source account picker | Static i18n | Yes | G4-S-12 | Payment form | **Keep** |
| A-107 | Payment — description placeholder | Static i18n | Yes | G4-S-10 | Payment form | **Keep** |
| A-108 | Adjustment route (URL only) | Static i18n | Yes | G4-S-05 | Direct URL; not in pickers | **Revise** ✓ *(propagated)* |

#### Group 4 outcome

| Status | Count | IDs |
|---|---|---|
| **Keep** | 15 | A-89 – A-91, A-94 – A-101, A-103 – A-107 |
| **Revise** *(implemented)* | 1 | A-93 / A-108 *(G4-S-05 adjustment title)* |
| **Missing** *(implemented)* | 1 | A-92 *(G4-S-03 `records.add.unsupportedAccountType`)* |
| **Implementation gap** *(resolved)* | 2 | A-92 *(wrong key)*; purchase/payment submit *(G4-S-11)* |
| **Deferred** | 0 | — |
| **Foundation gap** | 0 | — |

**G4-S-03 · `records.add.unsupportedAccountType` — Implemented**

| | EN | AR |
|---|---|---|
| **Added** | Manual records aren't supported for this account type | لا يمكن إضافة سجلات يدوية لهذا النوع من الحسابات |
| **Wiring** | `add-record-type-screen.tsx` (was `accounts.add.typeUnavailable`) |
| **Foundation rationale** | Content Principles §1 — Clarity; Writing Patterns §6 — scenario-appropriate message; review priority rule — context changes meaning, reopens shared source |
| **Impact** | Clarity, Pattern |

**G4-S-05 · `records.add.adjustment.title` — Implemented**

| | EN | AR |
|---|---|---|
| **Was** | Adjustment | تعديل |
| **Now** | Add adjustment | إضافة تعديل |
| **Foundation rationale** | Writing Patterns §1 — parallel object-name pattern with `records.add.{income,expense,transfer}.title` |
| **Impact** | Pattern, Clarity |

**G4-S-11 · Credit card form submit labels — Implemented**

| | |
|---|---|
| **Was** | `common.save` / `records.add.saving` on purchase and payment screens |
| **Now** | `creditCards.purchase.submit` / `.saving`; `creditCards.payment.submit` / `.saving` |
| **Foundation rationale** | Writing Patterns §1 — scenario commit labels (Save purchase, Save payment); §6 business scenarios |
| **Impact** | Pattern |

*Note: CC activity / purchase error states use `accounts.details.notFoundDescription` outside this group's surface list — flagged for Loading & errors groups if surfaced there.*

### Create account

#### Shared sources (Group 5)

New sources reviewed here reference **Reg ID** in the registry. Previously owned sources were verified unchanged (review priority category 4).

| Reg ID | Priority | Decision | Surfaces |
|---|---|---|---|
| REG-02 | 4 | **Keep** *(verified)* | A-111, A-150 |
| REG-03 | 4 | **Keep** *(verified)* | A-110 |
| REG-17 | 4 | **Keep** *(verified)* | A-128 |
| REG-23 | 4 | **Keep** *(verified)* | A-152 |
| REG-24, REG-25 | 4 | **Keep** *(Common)* | A-126, A-156 |
| REG-26 | 4 | **Deferred** | A-151 → Group 8 |
| REG-10 | 1 | **Keep** | A-115 *(standard create)* |
| REG-11 | 1 | **Implementation gap** ✓ | A-115 *(first-account)* |
| REG-12 | 1 | **Implementation gap** ✓ | A-115 *(certificate)* |
| REG-13, REG-14, REG-15 | 1 | **Keep** | A-114, A-118; A-109, A-112, A-113 |
| REG-15 | 1 | **Keep** | A-116, A-117 |
| REG-16 – REG-22 | 1 | **Keep** | A-119 – A-125, A-127 – A-143, A-149 |
| REG-21 | 1 | **Revise** ✓ | A-144 |
| REG-19 | 1 | **Keep** | A-155 |
| REG-27 | 4 | **Deferred** *(inventory)* | A-153 — not on create screens |

| ID | Surface | Runtime | Reviewable | Source | Visibility | Review status |
|---|---|---|---|---|---|---|
| A-109 | Type picker sheet title | Static i18n | Yes | REG-14 | Picker open | **Keep** |
| A-110 | Type picker — group headings | Static i18n | Yes | REG-03 | Picker open | **Keep** |
| A-111 | Type picker — card labels | Static i18n | Yes | REG-02 | Each type card | **Keep** |
| A-112 | Type picker — Coming soon badge | Static i18n | Yes | REG-14 | Disabled types | **Keep** |
| A-113 | Create title (typed) | Generated copy | Yes | REG-14 + REG-02 | `/accounts/new/[type]` | **Keep** |
| A-114 | First-account create title | Static i18n | Yes | REG-13 | `/accounts/new`, no accounts | **Keep** |
| A-115 | Create form lead | Static i18n | Yes | REG-10 / REG-11 / REG-12 | Per create flow | **Keep** / **Implementation gap** ✓ |
| A-116 | Create CTA — Create account | Static i18n | Yes | REG-15 | Default create footer | **Keep** |
| A-117 | Create CTA — Creating account | Static i18n | Yes | REG-15 | Submitting | **Keep** |
| A-118 | First-account CTA — Continue | Static i18n | Yes | REG-13 | First-account flow | **Keep** |
| A-119 | Form section — Account details | Static i18n | Yes | REG-16 | Create/edit forms | **Keep** |
| A-120 | Field — Account name | Static i18n | Yes | REG-16 | Forms | **Keep** |
| A-121 | Field — Current balance | Static i18n | Yes | REG-16 | Create when shown | **Keep** |
| A-122 | Field — Institution | Static i18n | Yes | REG-16 | Non-cash types | **Keep** |
| A-123 | Field — Account number (last 4) | Static i18n | Yes | REG-16 | When identifier shown | **Keep** |
| A-124 | Field — Certificate number (last 4) | Static i18n | Yes | REG-16 | Certificate forms | **Keep** |
| A-125 | Field — Loan number (last 4) | Static i18n | Yes | REG-16 | Loan forms | **Keep** |
| A-126 | Amount placeholder / EGP affix | Static i18n | Yes | REG-24 | Numeric fields | **Keep** |
| A-127 | Savings — Interest model section + chips | Static i18n | Yes | REG-18 | Savings create | **Keep** |
| A-128 | Savings — Annual rate field | Static i18n | Yes | REG-17 | Fixed model | **Keep** |
| A-129 | Savings — Tier fields | Static i18n | Yes | REG-18 | Tiered model | **Keep** |
| A-130 | Savings — Posting section + frequency chips | Static i18n | Yes | REG-18 | Savings form | **Keep** |
| A-131 | Savings — Posting day + last of month | Static i18n | Yes | REG-18 | Non-daily frequency | **Keep** |
| A-132 | Savings — Business day toggles | Static i18n | Yes | REG-22 | Daily frequency | **Keep** |
| A-133 | Savings — Destination section + chips | Static i18n | Yes | REG-18 | Savings form | **Keep** |
| A-134 | Savings — Destination account picker | Static i18n | Yes | REG-18 | Another account | **Keep** |
| A-135 | Certificate — name field | Static i18n | Yes | REG-19 | Certificate form | **Keep** |
| A-136 | Certificate — principal amount | Static i18n | Yes | REG-19 | Create only | **Keep** |
| A-137 | Certificate — purchase date | Static i18n | Yes | REG-19 | Create only | **Keep** |
| A-138 | Certificate — payout frequency chips | Static i18n | Yes | REG-19 | Create only | **Keep** |
| A-139 | Certificate — Recurring section | Static i18n | Yes | REG-16 | Certificate form | **Keep** |
| A-140 | Certificate — term chips | Static i18n | Yes | REG-19 | Create only | **Keep** |
| A-141 | Certificate — auto-transfer interest toggle | Static i18n | Yes | REG-19 | Certificate form | **Keep** |
| A-142 | Certificate — destination picker (auto interest) | Static i18n | Yes | REG-18 / REG-19 | `autoApplyInterest` on | **Keep** |
| A-143 | Certificate — renewal type picker | Static i18n | Yes | REG-19 | Certificate form | **Keep** |
| A-144 | Credit card — outstanding balance field | Static i18n | Yes | REG-21 | Create only | **Revise** ✓ |
| A-145 | Credit card — credit limit field | Static i18n | Yes | REG-20 | CC form | **Keep** |
| A-146 | Credit card — linked account picker | Static i18n | Yes | REG-20 | CC form | **Keep** |
| A-147 | Credit card — Statement section | Static i18n | Yes | REG-20 | CC form | **Keep** |
| A-148 | Credit card — statement due day chips | Static i18n | Yes | REG-20 | CC form | **Keep** |
| A-149 | Loan create — shared fields | Static i18n | Yes | REG-16 | Loan create (direct route) | **Keep** |
| A-150 | Account type labels (catalog) | Static i18n | Yes | REG-02 | Dynamic key selection | **Keep** |
| A-151 | Institution display names | Static i18n | Yes | REG-26 | Forms / cards | **Deferred** → Group 8 |
| A-152 | Account destination display | Generated copy | Yes | REG-23 | Pickers on create | **Keep** |
| A-153 | Record display sublines | Generated copy | Yes | REG-27 | *Not on create screens* | **Deferred** → inventory correction |
| A-154 | Statement / posting day numeric chips | Formatted value | No | — | Chip selects | — |
| A-155 | Certificate term year count chip | Generated copy | Yes | REG-19 | Term selection | **Keep** |
| A-156 | Empty value em dash | Static i18n | Yes | REG-25 | Missing values | **Keep** |
| A-157 | User-entered account name | User content | No | — | Create/edit | — |
| A-158 | User-entered descriptions | User content | No | — | *Misassigned — record/CC activity* | — |

#### Group 5 outcome

| Status | Count | IDs |
|---|---|---|
| **Keep** | 44 | A-109 – A-125, A-127 – A-143, A-145 – A-152, A-155, A-156 |
| **Revise** *(implemented)* | 1 | A-144 *(REG-21)* |
| **Implementation gap** *(resolved)* | 1 | A-115 *(REG-11, REG-12 leads)* |
| **Deferred** | 2 | A-151 → G8; A-153 → inventory correction |
| **Missing** | 0 | — |
| **Foundation gap** | 0 | — |

**REG-11 · `accounts.add.firstAccount.lead` — Implemented**

| | |
|---|---|
| **Was** | First-account flow used generic `accounts.add.lead` |
| **Now** | Wired in `add-money-account-screen.tsx` when `isFirstAccountFlow` |
| **Foundation rationale** | Writing Patterns §5 — first-account orientation copy; CONTENT.md documented first-account exception; dormant key A-D03 |
| **Impact** | Pattern, Clarity |

**REG-12 · `accounts.add.certificateLead` — Implemented**

| | |
|---|---|
| **Was** | Certificate create used generic `accounts.add.lead` |
| **Now** | Wired in `add-certificate-account-screen.tsx` |
| **Foundation rationale** | Writing Patterns §6 — type-specific scenario lead; dormant key A-D01 |
| **Impact** | Pattern, Clarity |

**REG-21 · `creditCards.fields.outstandingBalance.label` — Implemented**

| | EN | AR |
|---|---|---|
| **Was** | Current outstanding balance | الرصيد المستحق الحالي |
| **Now** | Outstanding balance | الرصيد المستحق |
| **Foundation rationale** | Product Terminology — Outstanding balance; aligns with `creditCards.details.outstandingBalance` (A-59) |
| **Impact** | Terminology |

### Edit account

#### Shared sources (Group 6)

| Reg ID | Priority | Decision | Surfaces |
|---|---|---|---|
| REG-02 | 4 | **Keep** *(verified)* | A-159 *(typed title `{type}`)* |
| REG-09 | 4 | **Keep** *(verified)* | A-164 |
| REG-16 | 4 | **Keep** *(verified)* | A-165 |
| REG-28 | 1 | **Implementation gap** ✓ | A-159 |
| REG-29 | 1 | **Implementation gap** ✓ | A-166 |

| ID | Surface | Runtime | Reviewable | Source | Visibility | Review status |
|---|---|---|---|---|---|---|
| A-159 | Edit screen title (typed) | Generated copy | Yes | REG-28 + REG-02 | `/accounts/[id]/edit` per type | **Keep** / **Implementation gap** ✓ |
| A-160 | Edit submit — money accounts | Static i18n | Yes | `accounts.edit.submit`, `.saving` | Current / cash / wallet edit | **Keep** |
| A-161 | Savings edit submit | Static i18n | Yes | `savings.edit.submit`, `.saving` | Savings edit | **Keep** |
| A-162 | Credit card edit submit | Static i18n | Yes | `creditCards.edit.submit`, `.saving` | CC edit | **Keep** |
| A-163 | Certificate edit submit | Static i18n | Yes | `certificates.edit.submit`, `.saving` | Certificate edit | **Keep** |
| A-164 | Edit router — not found | Static i18n | Yes | REG-09 | Missing account | **Keep** |
| A-165 | Edit forms — shared field copy | Static i18n | Yes | REG-16 | Per type | **Keep** |
| A-166 | Field editor — Save changes | Static i18n | Yes | REG-29 | Inline field sheets | **Keep** / **Implementation gap** ✓ |

#### Group 6 outcome

| Status | Count | IDs |
|---|---|---|
| **Keep** | 6 | A-160 – A-165; A-159, A-166 *(after gap fixes)* |
| **Implementation gap** *(resolved)* | 2 | A-159 *(REG-28 typed edit title)*; A-166 *(REG-29 confirm label)* |
| **Revise** | 0 | — |
| **Missing** | 0 | — |
| **Deferred** | 0 | — |
| **Foundation gap** | 0 | — |

**REG-28 · Typed edit screen title — Implemented**

| | |
|---|---|
| **Was** | All edit screens used generic `accounts.edit.title` ("Edit account") |
| **Now** | `accounts.edit.createTitle` + `getEditAccountScreenTitle` — mirrors create (`REG-14` / A-113) |
| **Wiring** | All five type edit screens |
| **Foundation rationale** | Writing Patterns §1 — parallel object-name pattern with create flow; type-specific `*.edit.title` keys remain unused (superseded by shared template) |
| **Impact** | Pattern, Clarity |

**REG-29 · `fieldEditor.confirm` — Implemented**

| | EN | AR |
|---|---|---|
| **Was** | Field editor workspace sheet defaulted to `common.save` ("Save") |
| **Now** | `fieldEditor.confirm` ("Save changes") wired in `field-editor-bottom-sheet.tsx` |
| **Foundation rationale** | Writing Patterns §1 — edit commit labels use Save changes; FOUNDATION §5 field editor |
| **Impact** | Pattern, Terminology |

*Note: Settings row edit action (A-39) correctly keeps generic `accounts.edit.title` — navigation label, not screen title.*

### Account-specific bottom sheets

#### Shared sources (Group 7)

Review priority category 4 for propagated sources; category 1 for account action picker pattern (REG-30).

| Reg ID | Priority | Decision | Surfaces |
|---|---|---|---|
| G4-S-01 | 4 | **Keep** *(verified)* | A-167 |
| G4-S-02 | 4 | **Keep** *(verified)* | A-168 *(types only — descriptions omitted by action-picker foundation)* |
| G4-S-08 | 4 | **Keep** / **Implementation gap** ✓ | A-169, A-170 |
| REG-14 | 4 | **Keep** *(verified)* | A-171 |
| REG-03 | 4 | **Keep** *(verified)* | A-171 *(section headings)* |
| REG-02 | 4 | **Keep** *(verified)* | A-171 *(card labels)* |
| REG-29 | 4 | **Keep** *(verified — G6)* | A-172 *(confirm action)* |
| REG-24 | 4 | **Keep** *(verified — G3)* | A-172 *(sign chips via A-29)* |
| REG-30 | 1 | **Keep** | A-167 – A-170 *(sheet chrome + card grid pattern)* |

#### Bottom sheet pattern audit (Group 7)

| Foundation | Title | Description | Actions | Empty / loading |
|---|---|---|---|---|
| **Account action picker** (`PickerBottomSheet` + `AccountActionPickerCard`) | `BottomSheetHeader` + sheet title key | None — compact icon + label cards; descriptions live on full-page hubs (A-90, A-102) only | Close (`a11y.dismiss`) + backdrop dismiss; no primary/secondary stack | N/A — fixed option set |
| **Account type picker** (`AccountTypePickerSheet`) | `BottomSheetHeader` + `accounts.add.chooseType` | None — type name + chevron / Coming soon badge | Close + backdrop dismiss | N/A — catalog-driven |
| **Field editor workspace** (`ImmersiveBottomSheet` variant) | Field label from open config | None — value editor is the body | Back (`common.back`) + **Save changes** (`REG-29`) | Inline validation only; no empty/loading |

| ID | Surface | Runtime | Reviewable | Source | Visibility | Review status |
|---|---|---|---|---|---|---|
| A-167 | Add record action sheet — title | Static i18n | Yes | G4-S-01 | Details sheet | **Keep** |
| A-168 | Add record sheet — type options | Static i18n | Yes | G4-S-02 *(types)* | Sheet open | **Keep** |
| A-169 | Add activity sheet — title | Static i18n | Yes | G4-S-08 | CC details sheet | **Keep** |
| A-170 | Add activity sheet — options | Static i18n | Yes | G4-S-08 | Sheet open | **Keep** / **Implementation gap** ✓ |
| A-171 | Account type picker sheet | Static i18n | Yes | REG-14, REG-03, REG-02 | List → Add account | **Keep** |
| A-172 | Field editor bottom sheet chrome | Static i18n | Yes | REG-29, REG-24, field labels | Balance / form edits | **Keep** |

#### Group 7 outcome

| Status | Count | IDs |
|---|---|---|
| **Keep** | 6 | A-167 – A-169, A-171, A-172; A-170 *(after gap fix)* |
| **Implementation gap** *(resolved)* | 1 | A-170 |
| **Revise** | 0 | — |
| **Missing** | 0 | — |
| **Deferred** | 0 | — |
| **Foundation gap** | 0 | — |

**A-170 · Add activity sheet option labels — Implemented**

| | Was | Now |
|---|---|---|
| **Labels** | `records.types.credit_card_purchase` / `_payment` ("Purchase", "Payment") | `creditCards.activity.purchase.title` / `.payment.title` ("Add purchase", "Add payment") |
| **Wiring** | `add-activity-action-sheet.tsx` |
| **Foundation rationale** | Writing Patterns §6 — credit card activity uses scenario labels; G4-S-08 approved `creditCards.activity.*` for activity option cards (A-102); review priority — wrong source reused record-type display nouns |
| **Impact** | Pattern, Clarity |

*Pattern note: Add record sheet (A-168) correctly uses `records.types.*` — same primary label as the full-page hub (A-90). Activity sheet now matches its full-page hub (A-102). Action picker cards intentionally omit supporting descriptions per frozen `AccountActionPickerCard` foundation.*

### Pickers

#### Shared sources (Group 8)

| Reg ID | Priority | Decision | Surfaces |
|---|---|---|---|
| REG-26 | 1 | **Deferred** *(catalog)* | A-175 |
| REG-02 | 4 | **Keep** *(verified)* | A-178 |
| REG-16 | 4 | **Keep** *(verified)* | A-179 *(interest destination picker keys)* |
| — | 4 | **Keep** *(Common)* | A-176 `picker.none` |
| — | 4 | **Keep** *(Common)* | A-180 `common.datePicker.*` |
| REG-19 | 4 | **Keep** *(verified)* | A-181 |

| ID | Surface | Review status |
|---|---|---|
| A-173 | Institution picker — search / empty / categories | **Keep** |
| A-174 | Institution picker — Other / custom name | **Keep** |
| A-175 | Institution catalog names (~50 keys) | **Deferred** |
| A-176 | Account picker — None option | **Keep** |
| A-177 | Account picker — row primary | — |
| A-178 | Account picker — row subtitle | **Keep** |
| A-179 | Account picker — search / no results | **Keep** |
| A-180 | Date picker chrome | **Keep** |
| A-181 | Renewal type picker options | **Keep** |
| A-182 | Interest destination picker component | **Deferred** *(unwired — forms use `AccountFormAccountPicker`)* |

#### Group 8 outcome

| Status | Count | IDs |
|---|---|---|
| **Keep** | 7 | A-173, A-174, A-176, A-178 – A-181 |
| **Deferred** | 2 | A-175 *(catalog)*; A-182 *(unwired component)* |
| **Revise** | 0 | — |
| **Implementation gap** | 0 | — |
| **Foundation gap** | 0 | — |

### Confirmations

#### Group 9 outcome

| ID | Surface | Review status |
|---|---|---|
| A-183 | Archive account confirm | **Keep** |
| A-184 | Archive certificate confirm | **Revise** ✓ |
| A-185 | Permanent delete confirm | **Keep** |

| Status | Count | IDs |
|---|---|---|
| **Keep** | 2 | A-183, A-185 |
| **Revise** *(implemented)* | 1 | A-184 |
| **Implementation gap** | 0 | — |
| **Deferred** | 0 | — |
| **Foundation gap** | 0 | — |

**A-184 · Certificate archive description — Implemented**

| | EN | AR |
|---|---|---|
| **Was** | …removed from active accounts and net worth. | …من حساباتك النشطة وصافي ثروتك. |
| **Now** | …net worth. **Records are preserved.** | …ثروتك. **تُحفظ السجلات.** |
| **Foundation rationale** | Writing Patterns §4 — archive confirmations state consequences; parallel with `accounts.details.archiveConfirm` (A-183) |

### Empty states

#### Group 10 outcome

| ID | Surface | Review status |
|---|---|---|
| A-186 | No accounts (active, first-time) | **Keep** / **Implementation gap** ✓ |
| A-187 | No archived accounts | **Keep** |
| A-188 | No recent records (details) | **Revise** ✓ |
| A-189 | No records this month (history) | **Revise** ✓ |

| Status | Count | IDs |
|---|---|---|
| **Keep** | 2 | A-186 *(copy)*, A-187 |
| **Revise** *(implemented)* | 2 | A-188, A-189 *(trailing periods)* |
| **Implementation gap** *(resolved)* | 1 | A-186 *(header Add hidden on first-time empty)* |
| **Deferred** | 0 | — |
| **Foundation gap** | 0 | — |

**A-186 · First-time empty header — Implemented**

| | |
|---|---|
| **Was** | Header **Add account** shown alongside empty-state CTA |
| **Now** | Header action hidden when `activeCount === 0` on active filter |
| **Foundation rationale** | Writing Patterns §5 — one outlined CTA; no header Add button when empty |

**A-188 / A-189 · Empty description punctuation — Implemented**

| | |
|---|---|
| **Was** | Trailing periods on single-sentence empty descriptions |
| **Now** | Periods removed |
| **Foundation rationale** | CONTENT.md — single-sentence helpers omit trailing period |

### Loading & transient states

#### Group 11 outcome

| ID | Surface | Review status |
|---|---|---|
| A-190 | Finance loading header | **Keep** |
| A-191 | List loading skeleton | — |
| A-192 | Details / form loading skeletons | — |
| A-193 | Pull-to-refresh indicator | — |
| A-194 | Offline pull toast | **Keep** |
| A-195 | Back online toast | **Keep** |
| A-196 | Finance refresh failure (list) | **Implementation gap** ✓ |

| Status | Count | IDs |
|---|---|---|
| **Keep** | 3 | A-190, A-194, A-195 |
| **Implementation gap** *(resolved)* | 1 | A-196 |
| **Revise** | 0 | — |
| **Deferred** | 0 | — |
| **Foundation gap** | 0 | — |

**REG-31 · Finance refresh error — Implemented**

| | |
|---|---|
| **Added** | `accounts.refreshError` + `FinanceRefreshErrorNotice` |
| **Wiring** | Accounts list; savings / CC / certificate details; records history; certificate edit |
| **Foundation rationale** | Writing Patterns §7 — lead with what failed; `common.retry` recovery CTA; mirrors dashboard `isFinanceLoadError` pattern |
| **Note** | Money account details has no pull-to-refresh — not applicable. Silent pull failures on successful initial load remain a cross-module concern. |

### Errors & validation

#### Shared sources (Group 12)

| Reg ID | Decision | Surfaces |
|---|---|---|
| REG-32 | **Revise** ✓ | A-197, A-198, A-200, A-207 *(name/principal/rate/purchaseDate)*, A-209 *(amount/correctBalance/date)* |
| — | **Keep** | A-199, A-201 – A-206, A-208, A-210 – A-212, A-211, A-214 *(after gap fix)* |

| ID | Surface | Review status |
|---|---|---|
| A-197 – A-209 | Validation messages | **Keep** / **Revise** ✓ *(REG-32 subset)* |
| A-210 | Form-level API error | **Keep** |
| A-211 | Inline field errors | **Keep** |
| A-212 | Archive / restore / delete API failure | **Keep** |
| A-213 | Process interest failure | **Implementation gap** ✓ |
| A-214 | Record form API failure | **Implementation gap** ✓ |
| A-215 | Quick-balance update failure | **Implementation gap** ✓ |
| A-216 | Settings toggle update failure | **Implementation gap** ✓ |
| A-217 | Finance refresh failure (details) | **Keep** *(REG-31 on pull-to-refresh screens)* |
| A-218 | Finance refresh failure (create/edit) | **Keep** *(REG-31 on certificate edit)* |

#### Group 12 outcome

| Status | Count | IDs |
|---|---|---|
| **Keep** | 14 | A-199 – A-206, A-208, A-210 – A-212, A-217, A-218 |
| **Revise** *(implemented)* | 10 keys | REG-32 *(A-197, A-198, A-200, A-207×4, A-209×3)* |
| **Implementation gap** *(resolved)* | 4 | A-213 – A-216 |
| **Deferred** | 0 | — |
| **Foundation gap** | 0 | — |

**REG-32 · Validation phrasing — Implemented**

| | Pattern |
|---|---|
| **Was** | `{Field} is required` |
| **Now** | `Enter…` / `Select…` per WRITING-PATTERNS §3 examples |
| **Impact** | Accounts, certificates, records validation keys in `en.ts` / `ar.ts` |

**A-213 – A-216 · Error feedback gaps — Implemented**

| ID | Fix |
|---|---|
| A-213 | Process interest failure → toast with `getSupabaseErrorMessage` / `common.retry` |
| A-214 | Record form catch → `getSupabaseErrorMessage` / `common.retry` |
| A-215 | Quick-balance save → toast on failure (money, savings, CC details) |
| A-216 | Settings toggles → toast on failure (money, savings, certificate details) |

### Success states

#### Group 13 outcome

| ID | Surface | Review status |
|---|---|---|
| A-219 – A-226 | Create / edit success toasts | **Keep** |
| A-227 – A-230 | Archive / restore / delete success | **Keep** |
| A-231 – A-236 | Record & activity success toasts | **Keep** |

| Status | Count | IDs |
|---|---|---|
| **Keep** | 18 | A-219 – A-236 |
| **Revise** | 0 | — |
| **Implementation gap** | 0 | — |
| **Deferred** | 0 | — |
| **Foundation gap** | 0 | — |

*Process interest and quick-balance edits remain silent on success — UI refresh only (documented in inventory).*

---

## Dormant i18n

Keys present in `en.ts` / `ar.ts` but not rendered in Accounts UI. Classify during review — likely **Deferred** → i18n cleanup pass unless an **Implementation gap** is found.

| ID | Key(s) | Notes |
|---|---|---|
| A-D01 | `accounts.add.balanceHint` | Certificate lead wired *(G5 REG-12)*; balanceHint still unused |
| A-D02 | `accounts.add.success`, `accounts.creating` | Success uses `common.accountCreated` or type-specific keys |
| A-D03 | — | `accounts.add.firstAccount.lead` wired *(G5 REG-11)* |
| A-D04 | `accounts.list.meta` | List uses type · last-4 via generated copy |
| A-D05 | `accounts.details.title`, `.addRecord`, `.edit` | Superseded by other keys |
| A-D06 | `accounts.fields.cardNumber.*` | CC uses `accountNumber` keys |
| A-D07 | `accounts.fields.institution.empty`, `accounts.fields.settings.title` | Unused |
| A-D08 | `accounts.fields.interestDestinationAccount.notSelected` | Unused in live pickers |
| A-D09 | `accounts.validation.balanceInvalid` | Unused |
| A-D10 | `savings.create.title`, `savings.create.lead`, `savings.balanceMethodHint` | Unused |
| A-D11 | `savings.fields.cycleStartDate.*`, `savings.validation.cycleStartDateRequired`, `.destinationRequired`, `.tiersMustStartAtZero` | Unused in UI |
| A-D12 | `certificates.create.title`, `certificates.validation.interestDestinationRequired` | Title via `createTitle` |
| A-D13 | `certificates.details.*` (interest schedule, outcomes, expected profit, etc.) | Many keys; details screen shows summary subset |
| A-D14 | `creditCards.actions.*`, `creditCards.details.utilization*` | `credit-utilization-progress.tsx` unused |
| A-D15 | `creditCards.payment.selectSourcePrompt`, `creditCards.payment.description` | Unused |
| A-D16 | `records.insufficientBalance`, `records.validation.amountInvalid` | Unused |
| A-D17 | `creditCards.validation.creditLimitInvalid` | Unused |
| A-D18 | `InterestDestinationPicker` component | Unwired (`interest-destination-picker.tsx`) |

---

## Inventory completeness statement

Built from implementation inspection — not translation files alone.

**Routes inspected:** All 11 routes under `src/app/(app)/accounts/**` (see route map).

**Components inspected**

- List: `accounts-list-screen.tsx`, `account-card.tsx`, `account-cards-section.tsx`, `accounts-list-skeleton.tsx`, `account-type-picker-sheet.tsx`
- Details: `account-details-screen.tsx`, `savings-details-screen.tsx`, `credit-card-details-screen.tsx`, `certificate-details-screen.tsx`, `account-details-chrome.tsx`, `account-details-summary.tsx`, `balance-metric-card.tsx`, `liability-balance-metric-card.tsx`, `recent-records-section.tsx`, `account-details-settings-section.tsx`, `archived-account-actions.tsx`
- Create: `add-money-account-screen.tsx`, `add-savings-account-screen.tsx`, `add-certificate-account-screen.tsx`, `add-credit-card-account-screen.tsx`, `add-lending-account-screen.tsx`, `add-account-type-router-screen.tsx`, form field components
- Edit: `edit-account-screen.tsx`, `edit-savings-account-screen.tsx`, `edit-credit-card-account-screen.tsx`, `edit-certificate-screen.tsx`, `edit-lending-account-screen.tsx`, `edit-account-router-screen.tsx`
- Records & activity: `account-records-history-screen.tsx`, `add-record-type-screen.tsx`, `add-record-form-screen.tsx`, `record-form-fields.tsx`, credit-card activity screens
- Sheets: `add-record-action-sheet.tsx`, `add-activity-action-sheet.tsx`, `field-editor-bottom-sheet.tsx`, `discard-dialog.tsx`
- Pickers: `institution-picker.tsx`, `account-picker.tsx`, `renewal-type-picker.tsx`
- Shared: `record-display.ts`, `account-labels.ts`, `field-validators.ts`, form validation modules

**i18n namespaces traced:** `accounts.*`, `savings.*`, `certificates.*`, `creditCards.*`, `records.*`, `institutions.*`, plus shared `common.*`, `picker.*`, `connectivity.*`, `businessDays.*`, `dashboard.netWorth.updated` (balance meta).

**Conclusion:** All Accounts routes and nested journeys were inspected. Surfaces are inventoried as **A-01 – A-236** (plus dormant **A-D01 – A-D18**). Institution catalog reviewed as one bundled surface (**A-175**).

---

## Summary

| Category | Count |
|---|---|
| Total surface IDs | **236** |
| Reviewable | **~197** |
| Non-reviewable | **~25** |
| Cross-module reviewable | **~12** (Common, Connectivity, Dashboard meta) |
| Dormant i18n entries | **18** *(Deferred → i18n cleanup pass)* |
| Review groups | **13** *(complete)* |

**Module review:** Complete. See completion record below.

---

## Module completion record

| Field | Value |
|---|---|
| **Module** | Accounts |
| **Product maturity** | Complete |
| **Review date** | 2026-06-30 |
| **Inventory version** | 1.0 |
| **Final counts** | Keep **~175** · Revise **~18** (implemented) · Missing **1** (implemented, G4) · Implementation gap **~12** (resolved) · Deferred **~8** · Foundation gap **0** |
| **Deferred items** | A-01 → Navigation & IA · A-175 / REG-26 → institution catalog bulk review · A-182 / A-D18 → unwired `InterestDestinationPicker` · Dormant i18n A-D01 – A-D17 → cleanup pass · G3 `notFoundDescription` punctuation · silent pull-to-refresh failures (cross-module) |
| **Foundation changes introduced** | `FinanceRefreshErrorNotice` · `accounts.refreshError` · `accounts.edit.createTitle` / `getEditAccountScreenTitle` *(G6)* |
| **Build / test status** | `npm test` — 354 passed · `npm run build` — succeeded |
