# Nume Foundation v1 — Frozen

Foundation patterns are **product rules**, not implementation suggestions.

**Core principle:** No screen-specific interaction decisions. No one-off fixes. No duplicated implementations. Any deviation must be deliberate, documented, and justified.

Before implementing a new interaction, ask: **"Which Foundation pattern does this belong to?"**

| Pattern | Component(s) | When to use |
|---|---|---|
| Workspace | `ImmersiveBottomSheet` (`variant="workspace"`) | Focused text/numeric input (Field Editor, future notes) |
| Calendar | `DatePickerBottomSheet` | All date selection |
| Picker | `PickerBottomSheet` | Selection lists, institution pickers, category pickers |
| Editable field | `EditableField` + Field Editor provider | Form fields that accept keyboard input |
| Confirmation | `ConfirmationBottomSheet` | Destructive / irreversible confirms only |

If none apply → propose a new Foundation pattern **before** implementation.

**Patterns do not overlap.** No screen-specific implementations. No undocumented exceptions.

---

## Design Audit — frozen foundations registry

All foundations below are **mandatory building blocks**. Future screens, flows, modules, account types, dialogs, bottom sheets, pickers, and features **must consume** them.

| # | Foundation | Key components | Doc section |
|---|---|---|---|
| 1 | **Header** | `RootPageHeader`, `StackPageHeader`, `AccountDetailsStackHeader`, `BottomSheetHeader` | § 9 |
| 2 | **Picker list** | `PickerList`, `PickerListOption`, `PickerListDivider`, `PickerListNoneOption` | § 3 |
| 3 | **Account details** | `AccountDetailsStackHeader`, `AccountDetailsContentHeader`, `AccountDetailsSummary` | § 11 |
| 4 | **Create account CTA** | `AccountCreateActionButton`, shared i18n copy | § 10 |
| 5 | **Confirmation actions** | `ConfirmationSheetActions`, `ConfirmationBottomSheet` | § 10, § 6 |
| 6 | **Typography & copy** | Sentence case, helper description punctuation — `docs/CONTENT.md`, `en.ts` | § 10, CONTENT |
| 7 | **Numeric typography** | `CurrencyAmount`, `ResponsiveCurrencyAmount`, `formatCurrency` | § 10 |
| 8 | **Inline field editor** | `EditableField`, `FieldEditorBottomSheet`, `FieldEditorSurface`, `FieldSignToggle` | § 5 |
| 9 | **Account cards** | `AccountCard`, `AccountCardsSection` | § 14 |
| 10 | **Account picker** | `AccountPicker`, `AccountPickerOptionRow`, `AccountRowContent` | § 15 |

**Do not recreate** headers, picker lists, account-details layouts, create-account CTAs, confirmation actions, typography behaviors, numeric display behaviors, field-editor behaviors, account-card layouts, or account-picker row layouts inside individual screens.

---

## 1. Immersive Bottom Sheets

Shared chrome for all sheet types:

- `SCREEN_HEADER_*` tokens from `screen-header.tsx`
- `BOTTOM_SHEET_*` from `bottom-sheet-chrome.tsx`
- Shared backdrop, safe-area handling, motion

**Do not** create custom sheet implementations.

### Height tokens

| Experience | Sizing | Location |
|---|---|---|
| Workspace (Field Editor) | Fixed immersive max | `lib/layout/immersive-sheet.ts` |
| Calendar | Fixed content height | `lib/layout/date-picker-sheet.ts` |
| Picker | Content-fitted clamp | `lib/layout/picker-sheet.ts` |

---

## 2. Workspace Sheets

Focused user input → `ImmersiveBottomSheet` with `variant="workspace"`.

**Rules:**

- Underlying page locked (`useModalLayerLock` + `useImmersiveWorkspaceLock`)
- Underlying form locked (`html[data-modal-open]` → `[data-app-scroll]` frozen)
- Document scroll locked (`html[data-immersive-workspace]`)
- Sheet container fixed — no drag, no resize
- **Auto-focus** on open with immediate keyboard
- Keyboard interacts only with the workspace
- Body `overflow-hidden` for typical short fields

**Examples:** Field Editor, future rich text / note editing.

---

## 3. Picker Sheets

Generic selection → `PickerBottomSheet`.

**NOT workspace or calendar sheets.**

### Height

```text
clamp(
  viewport / 3,
  content height + chrome + bottom padding,
  viewport − (header zone × 2)
)
```

| Bound | Token |
|---|---|
| Minimum | `PICKER_SHEET_MIN_HEIGHT` — `calc(100dvh / 3)` |
| Maximum | `PICKER_SHEET_MAX_HEIGHT` — same as immersive upper bound |
| Bottom padding | `PICKER_SHEET_BOTTOM_PADDING` — tab bar + safe area |

Small lists grow naturally. Large lists cap at the immersive maximum and scroll internally.

### Layout

```text
Header (pinned)
↓
Optional Search (pinned, item count > 10)
↓
Scrollable content
↓
Bottom padding = tab bar + safe area (+ keyboard inset when searching)
```

### Scrolling

- Sheet container fixed — no drag, no snap points
- Only `[data-sheet-scroll]` content scrolls
- Page frozen (`useModalLayerLock` + `useSearchSheetLock`)

### Search (conditional)

Show search when `shouldShowPickerSearch(itemCount)` — item count **> 10**.

When search is shown:

- No auto-focus, no automatic keyboard
- Search pinned below title
- **Height locked on open** — initial unfiltered content sets sheet height; filtering does not resize the sheet
- Keyboard inset on content padding only
- Manual focus uses `preventScroll`

Selection is immediate on row tap (no Save).

**Search-enabled pickers** (item count > 10): height is calculated once from initial unfiltered content and locked for the sheet session. Filtering and empty states do not resize the container.

**Non-search pickers**: content-driven height with `ResizeObserver` — clamp(min, content, max).

**Examples:** Institution pickers, interest destination, future category pickers.

### Picker list (frozen)

All selectable option lists inside picker sheets compose through **`PickerList`** (`components/ui/picker-list.tsx`).

| Rule | Foundation |
|---|---|
| Row dividers | `PickerList` inserts `PickerListDivider` between every row — 2px gap above and below each divider line |
| Zero corner radius | `PickerListOption` / `PICKER_OPTION_ROW_CLASS` — `rounded-none` on every row |
| Unified None (optional pickers) | `PickerListNoneOption` — label `picker.none` ("None"), always first row |
| Mandatory pickers | No None row — omit `PickerListNoneOption` |

**Do not** implement dividers, row radius, or clear/empty labels per picker.

Optional pickers use `shouldShowPickerNoneOption()` for search filtering. Mandatory pickers include institution, renewal type, account type navigation, and account pickers without `allowClear`.

**Documented exception:** Date month/year wheel (`WheelColumn`) — scroll-wheel UX, not a tap list.

---

## 4. Calendar Sheets

All date selection → `DatePickerBottomSheet`.

- Fixed calendar content height (`DATE_PICKER_SHEET_HEIGHT`)
- Draft state; **Save** commits, **Back** / backdrop discards
- Month grid + month/year wheel picker

Trigger: `DateField` only.

---

## 5. Inline field editor (frozen)

All inline-field editors opened in workspace bottom sheets compose through **`EditableField`** + **`FieldEditorProvider`** + **`FieldEditorBottomSheet`**.

Location: `components/field-editor/`, `lib/field-editor/`, `providers/field-editor-provider.tsx`.

### Approved components

| Component | Role |
|---|---|
| `EditableField` | Inline trigger — opens the field editor with synchronized label, placeholder, and value |
| `FieldEditorBottomSheet` | Workspace sheet chrome, sign-chip layout, keyboard inset |
| `FieldEditorSurface` | Borderless centered editor input — typography, placeholder, wrapping |
| `FieldSignToggle` | Positive / negative chips for eligible balance fields only |

### Rule 1 — Header title synchronization

Bottom sheet header title **must** match the originating field label exactly.

- Source of truth: field `label`
- No separate sheet titles or custom overrides
- Normalized in `normalizeFieldEditorOpenConfig`

### Rule 2 — Placeholder synchronization

Editor placeholder **must** match the originating field placeholder.

- Single definition on `EditableField` — passed through on open
- Sanitized once via `sanitizeFieldEditorPlaceholder` (Rule 4.1)

### Rule 3 — Existing value synchronization

When a field has a value, the editor displays the **same formatted value** as the inline trigger.

- Raw `value` drives draft state; `formatDisplay` / `displayValue` keep presentation aligned
- Balance fields with sign chips: unsigned amount in editor, sign on chips (existing sign logic unchanged)

### Rule 4 — Placeholder styling

| Requirement | Foundation |
|---|---|
| One shared placeholder color | `FIELD_EDITOR_PLACEHOLDER_CLASS` — `placeholder:text-muted-foreground` |
| One shared implementation | `FieldEditorSurface` only |
| No black placeholder text | Enforced via muted foreground token |
| No field-specific placeholder colors | Prohibited |

Location: `lib/field-editor/field-editor-chrome.ts`.

### Rule 4.1 — Placeholder content cleanup

Placeholders describe the field only — **no unit suffixes** (EGP, %, currency codes, parenthetical units).

- Applied in `sanitizeFieldEditorPlaceholder` on open and on inline trigger display
- **`stripFieldEditorUnitLabels`** removes `prefixLabel` / `suffixLabel` from the editor session — unit tokens never render beside the editor input (e.g. rate fields must not show `%` in the sheet)
- Units belong on the **inline trigger**, field labels, helper text, or formatting layers — not in the editor surface or placeholder state

Location: `lib/field-editor/placeholder.ts`, `lib/field-editor/editor-display.ts`.

### Rule 5 — Typography

| Property | Rule |
|---|---|
| Font weight | Regular (`font-normal`) |
| Maximum size | 22px (`text-[1.375rem]`) |
| Larger than 22px | Reduced to 22px |
| Smaller than 22px | Not upscaled in editor |

Location: `FIELD_EDITOR_SURFACE_INPUT_CLASS`.

### Rule 6 — Multi-line behavior

Editor content wraps naturally — no truncate, overflow, or clip.

- `FieldEditorSurface` uses auto-height `textarea` with `whitespace-pre-wrap break-words`
- Full width (`w-full max-w-full`)

### Rule 7 — Positive / negative chips

Applies **only** to account balance fields for: Current Account, Wallet, Cash, Savings.

**Not** for: Loans, Credit Cards, Records, Certificates, or other numeric fields.

Layout (top → bottom):

```text
Field editor content
24px gap
Positive / negative chips
24px gap
Keyboard
```

Tokens: `FIELD_EDITOR_SIGN_CHIP_GAP_PX`, `FIELD_EDITOR_KEYBOARD_CHIP_GAP_PX`.

Chips remain visible above the keyboard. Sign logic unchanged — layout only.

### Rule 8 — Keyboard submit (frozen)

All keyboard confirmation actions **must** invoke the same save path as the sheet **Save** action — no duplicated validation or submit logic.

| Action | How it is handled |
|---|---|
| Text keyboard **Done** / **Go** / **Enter** / **Return** | `keydown` / `keyup` + `isFieldEditorKeyboardSubmitKey` (incl. legacy `keyCode` 13) |
| **Form submit** (hidden submit control) | `<form onSubmit>` → shared debounced submit |
| iOS **numeric / decimal** keyboard **Done** | Blurs the field without Enter — `onBlur` → shared debounced submit |
| Backdrop / **Back** discard | `onDiscardPointerDown` sets discard intent — blur submit suppressed |

All paths call `FieldEditorBottomSheet.handleConfirm` via one debounced `onSubmit` in `FieldEditorSurface`.

- **Shift+Enter** inserts a newline in text fields; plain **Enter** submits
- Backdrop and header Back discard the draft — they must not trigger blur submit

**Platform note:** iOS numeric pads have no Enter key; blur-after-Done is the required submit path. Discard intent prevents accidental save when closing the sheet.

Location: `lib/field-editor/keyboard-submit.ts`, `FieldEditorSurface`, `FieldEditorBottomSheet`, `ImmersiveBottomSheet.onDiscardPointerDown`.

### Future inline-field rule

Any current or future inline-field editor **must** inherit unit-suffix cleanup and keyboard-submit behavior (standard, numeric, and mobile confirmation) through the shared foundation. Do not implement these in individual screens.

### Propagation rule

Changes to the field editor foundation **must propagate** to every consumer automatically. No screen-by-screen field editor updates.

### Documented exceptions

| Surface | Approach | Status |
|---|---|---|
| Auth credentials | Native inputs — not field editor | ✅ Excluded |
| Institution "Other" custom name | Inline `Input` | ⚠️ Documented in § Audit status |
| Picker search fields | Search inside picker sheet | ✅ Not field editor |

---

## 5a. Editable field triggers

All editable form fields → `EditableField`.

**Excluded:**

- Search inside `PickerBottomSheet`
- Picker triggers (institution, destination, date, chips)
- Auth credentials
- Institution "Other" custom name inline `Input` (documented exception)

---

## 6. Save / Discard Semantics

| Action | Behavior |
|---|---|
| **Save** | Explicit save; updates canonical state (Workspace, Calendar) |
| **Back** | Discards draft |
| **Backdrop** | Same as Back |

Pickers: row tap selects immediately — no draft.

Confirmations: separate destructive flow.

---

## 7. Keyboard Ownership

The active surface owns the keyboard. No page scroll, layout shifts, or screen-specific keyboard hacks behind sheets.

---

## 8. Shared Tokens

No duplicated values or local overrides for header typography, icon sizes, touch targets, safe areas, RTL, or motion.

---

## 9. Page Headers (frozen)

Header components are **official building blocks** for all app screens. Header Foundation is complete and frozen.

**Do not build custom headers inside screens.**

Before adding a screen, ask: **"Which header building block does this use?"**

### Approved header components

| Building block | Component(s) | Location | When to use |
|---|---|---|---|
| **Root page header** | `RootPageHeader` + `RootPageTitle` | `components/layout/stack-page-chrome.tsx` | Tab-root screens: Dashboard, Accounts, Planning, Goals, More |
| **Stack page header** | `StackPageHeader` + `StackPageTitle` | `components/layout/stack-page-chrome.tsx` | All navigated sub-screens (create, edit, pickers-as-pages, More sub-routes) |
| **Account details header** | `AccountDetailsStackHeader` + `AccountDetailsContentHeader` | `components/accounts/account-details-chrome.tsx` | Current Account, Savings, Certificate, Credit Card, Loan, Cash, Wallet, Gold, Stocks |
| **Bottom sheet header** | `BottomSheetHeader`, `BottomSheetHeaderlessContent` | `components/ui/bottom-sheet-chrome.tsx` | All bottom sheets: picker, workspace/editor, form, confirmation, headerless |

Sheet types compose the bottom sheet header through their Foundation wrappers (`PickerBottomSheet`, `ImmersiveBottomSheet`, `ConfirmationBottomSheet`, `DatePickerBottomSheet`). **Do not** add sheet headers inline.

### Component reuse rule

New screens **must** consume an existing header component:

- New root tab screen → `RootPageHeader` + `RootPageTitle`
- New stack screen → `StackPageHeader` + `StackPageTitle`
- New account details screen → `AccountDetailsStackHeader` + `AccountDetailsContentHeader`
- New bottom sheet → bottom sheet Foundation + `BottomSheetHeader` / `BottomSheetHeaderlessContent`

Creating a custom header implementation inside a screen is **not allowed**.

Configure headers through **props and composition only** — never reimplement layout, spacing, typography, sizing, collapse behavior, actions, borders, icon sizing, or truncation in screen files.

### Single source of truth

All header behavior lives in shared foundation components and their layout tokens:

- `components/layout/screen-header.tsx` — page header primitive, body layout, action buttons
- `components/layout/screen-title-collapse.tsx` — large-title collapse system
- `components/layout/stack-page-chrome.tsx` — root and stack page headers
- `components/accounts/account-details-chrome.tsx` — account details header variant
- `components/ui/bottom-sheet-chrome.tsx` — bottom sheet header chrome
- `lib/layout/screen-spacing.ts` — page header spacing and typography tokens
- `lib/layout/bottom-sheet.ts` — sheet header bar sizing tokens

`ScreenHeader` is an **internal primitive**. Screens use `RootPageHeader`, `StackPageHeader`, or `AccountDetailsStackHeader` — not `ScreenHeader` directly — except documented transient-state exceptions below.

### Propagation rule

Any change to Root, Stack, Account Details, or Bottom Sheet header foundations **must propagate automatically** to every screen that uses that component.

**No screen-by-screen header updates.**

Fix behavior once in the foundation; all consumers inherit the change.

### Page title spacing (frozen)

Large in-content page title → next content block = **24px**.

- Token: `SCREEN_PAGE_TITLE_TO_CONTENT_GAP_PX` / `SCREEN_PAGE_TITLE_TO_CONTENT_GAP_CLASS` (`mb-6`)
- Applied on `ScreenPageTitle` (`RootPageTitle`, `StackPageTitle`)
- **Do not** add per-screen margins below page titles

**Documented exception:** `AccountDetailsSummary` uses `StackPageTitle` with `mb-0` — in-card account name, not a page-title block.

### Variant rule

If a future exception is required:

1. Create a **documented foundation variant** (new exported component or prop on an existing foundation component).
2. Add the variant to the audit table in this document.
3. **Do not** fork header markup, spacing, or collapse logic inside individual screens.

### Documented exceptions

| Surface | Header approach | Status |
|---|---|---|
| Auth screens (login, register, reset) | Custom auth layout — no page header foundation | ✅ Excluded |
| Transient loading / not-found guards | Direct `ScreenHeader` with static title (`collapsibleTitle={false}`) | ⚠️ Allowed until a foundation loading variant exists |
| Institution "Other" custom name | Inline input | ⚠️ Documented in § Audit status |

---

## 10. Form actions, typography, and numeric display (frozen)

### Account creation CTA

All account creation screens use **`AccountCreateActionButton`** (`components/patterns/account-create-action-button.tsx`).

| State | Label | i18n |
|---|---|---|
| Submit | Create account | `accounts.createAccount` |
| Loading | Creating account | `accounts.create.submitting` |

Do not add per-type create button labels in screens or i18n.

**Exception:** First-account onboarding may override with `accounts.add.firstAccount.cta`.

Keys: `lib/finance/account-create-copy.ts`.

### Form primary button sizing

`FORM_PRIMARY_ACTION_BUTTON_CLASS` (`h-12 w-full text-base`) — account create/edit sticky footers.

Location: `lib/layout/form-action-chrome.ts`.

### Confirmation sheet actions

All confirmation surfaces use **`ConfirmationSheetActions`** (`components/ui/confirmation-sheet-presentation.tsx`).

- Shared button sizing via `CONFIRMATION_SHEET_ACTION_BUTTON_CLASS` (`h-12`) — matches form primary actions
- Shared primary + secondary action layout
- Shared loading-label behavior on primary action

Used by `ConfirmBottomSheet`, `DiscardDialog`, and future confirmation patterns. Do not inline confirmation button stacks in screens.

### Typography and copy

System-generated copy uses **sentence case**. See **`docs/CONTENT.md`**.

| Rule | Where |
|---|---|
| Sentence case for labels, titles, CTAs, helpers, empty states, validation | `en.ts` |
| No modification of user-entered content | App-wide |
| Single-sentence helpers omit trailing period | `en.ts` |
| Multi-sentence copy uses normal punctuation | `en.ts` |

Never apply capitalization transforms to user-entered values (account names, notes, institution names, imported data).

### Numeric typography

Currency amounts render integer and decimal digits at the **same font size**.

| Component | Location | Use |
|---|---|---|
| `CurrencyAmount` | `components/ui/currency-amount.tsx` | Inline / row displays |
| `ResponsiveCurrencyAmount` | `components/ui/responsive-currency-amount.tsx` | Hero / metric displays |
| `formatCurrency` / `getCurrencyDisplayParts` | `lib/format/currency-display.ts` | String formatting |

Do not scale decimal portions separately.

---

## 11. Account details (frozen)

All account detail screens compose through **`account-details-chrome.tsx`**.

### Approved components

| Component | Role |
|---|---|
| `AccountDetailsStackHeader` | Navigation header — account name collapse into header on scroll |
| `AccountDetailsContentHeader` | Content header wrapper for all detail screens |
| `AccountDetailsSummary` | Logo block + institution subtitle + account name (large title) |

Location: `components/accounts/account-details-chrome.tsx`, `components/accounts/account-details-summary.tsx`.

### Rules

- **Shared layout** — logo block, metadata, and large title live in the foundation, not per screen
- **Shared collapse behavior** — large title + header transition via `ScreenTitleCollapseProvider`
- **Shared logo block** — 56×56 logo, 16px gap to metadata, type-initial fallback
- **Shared metadata structure** — institution · account number, then account name

### Component reuse rule

New account detail screen (any account type) → `AccountDetailsStackHeader` + `AccountDetailsContentHeader`.

Configure through **props only** (`accountName`, `institution`, `institutionSubtitle`, `accountType`). Do not fork layout markup in screen files.

### Applies to

Current account, savings, certificate, credit card, loan, cash, wallet, gold, stocks — and **all future account types**.

---

## 14. Account cards (frozen)

All account cards on the **Accounts** tab compose through **`AccountCard`** and **`AccountCardsSection`**.

Location: `components/accounts/account-card.tsx`, `components/accounts/account-cards-section.tsx`, `lib/layout/account-card-chrome.ts`.

### Approved components

| Component | Role |
|---|---|
| `AccountCard` | Single account card — logo, type row, name, balance |
| `AccountCardsSection` | Category label + stacked cards with foundation spacing |

### Spacing tokens

| Rule | Token | Value |
|---|---|---|
| Category label → first card | `ACCOUNT_CARD_CATEGORY_TO_FIRST_GAP_PX` | 16px |
| Card → card (same category) | `ACCOUNT_CARD_GAP_PX` | 16px |
| Last card → next category label | `ACCOUNT_CARD_CATEGORY_GAP_PX` | 24px |
| Card internal padding | `ACCOUNT_CARD_PADDING_PX` | 16px |
| Logo → text block | `ACCOUNT_CARD_LOGO_TEXT_GAP_PX` | 8px |
| Top section → divider / divider → balance | `ACCOUNT_CARD_SECTION_DIVIDER_GAP_PX` | 16px |

### Layout rules

1. Logo **45×45** — existing institution logo / fallback behavior unchanged
2. Type row — **13px regular** — localized account type · last-4 via `formatAccountCardInstituteRow` (type label from `getAccountTypeCardLabelKey`; when no account number, type label only)
3. Account name — **15px medium**, single-line truncated
4. Divider — `border-border` between top section and balance
5. Balance label — **13px medium**, sentence case (`accounts.sections.balance`)
6. Balance value — **18px semibold** via `CurrencyAmount` + `ACCOUNT_CARD_BALANCE_VALUE_CLASS` (numeric typography foundation)
7. Subtle shadow — `ACCOUNT_CARD_SHADOW_CLASS` only
8. Corner radius — existing `rounded-lg` on card container

### Propagation rule

New account types on the Accounts tab **must** use `AccountCard` — no custom card layouts in screens.

---

## 15. Account picker (frozen)

All account selection lists compose through **`AccountPicker`**, **`AccountPickerOptionRow`**, and **`AccountRowContent`**.

Location: `components/ui/account-picker.tsx`, `components/accounts/account-picker-option-row.tsx`, `components/accounts/account-row-content.tsx`, `lib/layout/picker-option-row.ts`.

**Institution Picker is the visual source of truth** for typography, logo sizing, row structure, and spacing.

### Rules

1. **No balances** — picker rows never show balance labels, values, or currency amounts
2. **Institution Picker visual parity** — same typography, logo size, row structure, alignment, and spacing rhythm
3. **Shared typography** — `PICKER_ROW_PRIMARY_LABEL_CLASS`, `PICKER_ROW_SECONDARY_LABEL_CLASS` from `picker-option-row.ts`
4. **Shared logo sizing** — `InstitutionBrandAsset` default picker size (32×32); not account-card logo size
5. **Shared spacing** — `PICKER_ROW_OPTION_LAYOUT_CLASS` (`min-h-11 gap-3`)
6. **Row structure** — `[Logo] Account Name` on first row; `Account Type · Last 4 Digits` on second row
7. **Metadata** — localized account type via `getAccountTypeCardLabelKey`; last-4 via `resolveAccountNumberLast4` + `formatAccountCardInstituteRow`; type-only when no number
8. **Propagation** — `InterestDestinationPicker` and all `AccountPicker` consumers inherit automatically
9. **No custom implementations** — do not fork account-picker row markup in screens

### Approved components

| Component | Role |
|---|---|
| `AccountPicker` | Account selection trigger + picker sheet |
| `AccountPickerOptionRow` | Single selectable account row in picker lists |
| `AccountRowContent` | Row content — logo, name, type · last-4 |

**Documented exception:** `InterestDestinationPicker` — specialized trigger copy; list rows still use `AccountPickerOptionRow`.

---

## 12. Future screen rule (mandatory)

Any new screen, flow, module, account type, dialog, bottom sheet, picker, or feature added to NUME **must**:

1. Identify which frozen foundation(s) apply (registry above).
2. Consume the approved shared component(s) — configure via props and composition only.
3. Add copy to `src/lib/i18n/messages/en.ts` following **`docs/CONTENT.md`**.
4. Document any required exception in the audit table (§ Audit status).

**Developers must not recreate inside individual screens:**

- Headers
- Picker lists
- Account details layouts
- Create-account CTAs
- Confirmation action stacks
- Typography / capitalization behaviors
- Numeric display behaviors
- Field editor headers, placeholders, typography, wrapping, sign-chip layout, unit-suffix cleanup, or keyboard-submit handlers
- Account card layouts on the Accounts tab
- Account picker row layouts in selection sheets

If no foundation fits → **propose a new foundation pattern before implementation** (see variant rule).

---

## 13. Global propagation and variant rules

These rules apply to **all** frozen foundations (headers, picker lists, account details, CTAs, confirmations, typography, numeric display).

### Propagation rule

Changes to a foundation component **must propagate automatically** to every existing and future consumer.

Fix behavior once in the shared foundation. **No screen-by-screen updates.**

### Variant rule

If a genuine exception is required:

1. Create a **documented foundation variant** (new exported component or prop on an existing foundation component).
2. Add the variant to the audit table in this document.
3. **Do not** fork markup, spacing, typography, or interaction logic inside individual screens.

---

## Audit status (v1 final)

| Surface | Pattern | Status |
|---|---|---|
| Dashboard, Accounts, Planning, Goals, More | Root page header | ✅ |
| Stack sub-screens (create, edit, records, More routes) | Stack page header | ✅ |
| All account detail types | Account details foundation | ✅ |
| All account creation flows | Create account CTA foundation | ✅ |
| Confirm / discard / archive dialogs | Confirmation actions foundation | ✅ |
| Picker / workspace / calendar / confirmation sheets | Bottom sheet header | ✅ |
| Field Editor | Workspace | ✅ |
| Date Picker | Calendar | ✅ |
| Institution picker (all types) | Picker + picker list | ✅ |
| Interest destination picker | Picker + picker list | ✅ |
| Account / renewal / account-type pickers | Picker + picker list | ✅ |
| Currency / metric displays | Numeric typography foundation | ✅ |
| System copy (EN) | Typography & copy foundation | ✅ |
| All inline field editors | Field editor foundation | ✅ |
| Accounts tab list cards | Account cards foundation | ✅ |
| Account picker rows | Account picker foundation | ✅ |
| Confirmation / discard | Confirmation | ✅ Intentional |
| Auth screens | — | ✅ Excluded |
| Institution "Other" custom name | Inline input | ⚠️ Documented exception |
| Transient loading / not-found guards | Direct `ScreenHeader` | ⚠️ Until loading-header variant |
| Date month/year wheel | `WheelColumn` | ⚠️ Scroll-wheel UX — not tap list |
| First-account onboarding CTA | `Continue` override | ⚠️ Documented exception |
| Detail screen settings / record lists | `divide-y` list rows | ✅ Not picker lists — separate pattern |
| Auth register submit | Auth layout | ⚠️ Separate auth flow — same copy keys |

---

## Governance checklist

Before shipping any screen or feature:

1. Identify the Foundation pattern(s) from the registry
2. Identify the header building block (§ 9) if applicable
3. Identify picker list, account details, CTA, confirmation, typography, numeric, and field editor foundations
4. Reuse shared components — do not fork
5. Add copy to `en.ts` per **`docs/CONTENT.md`**
6. Document any deviation in the audit table

**All Design Audit foundations are frozen:** Header, Picker list, Account details, Create account CTA, Confirmation actions, Typography & copy, Numeric typography, Inline field editor, Account cards.
