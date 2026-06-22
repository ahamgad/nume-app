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

## 5. Editable Fields

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

## Audit status (v1 final)

| Surface | Pattern | Status |
|---|---|---|
| Dashboard, Accounts, Planning, Goals, More | Root page header | ✅ |
| Stack sub-screens (create, edit, records, More routes) | Stack page header | ✅ |
| All account detail types | Account details header | ✅ |
| Picker / workspace / calendar / confirmation sheets | Bottom sheet header | ✅ |
| Field Editor | Workspace | ✅ |
| Date Picker | Calendar | ✅ |
| Institution picker (all types) | Picker | ✅ |
| Interest destination picker | Picker | ✅ |
| Account / renewal / account-type pickers | Picker list | ✅ |
| Confirmation / discard | Confirmation | ✅ Intentional |
| Auth screens | — | ✅ Excluded |
| Institution "Other" custom name | Inline input | ⚠️ Documented exception |

---

## Governance checklist

1. Identify the Foundation pattern
2. Identify the header building block (§ 9)
3. Reuse the component — do not fork
4. Use shared layout tokens
5. Document any deviation in the audit table

**Foundation v1 is frozen. Header Foundation is frozen.**
