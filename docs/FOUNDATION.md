# Nume Foundation v1 — Frozen

Foundation patterns are **product rules**, not implementation suggestions.

**Core principle:** No screen-specific interaction decisions. No one-off fixes. No duplicated implementations. Any deviation must be deliberate, documented, and justified.

Before implementing a new interaction, ask: **"Which Foundation pattern does this belong to?"**

| Pattern | Component(s) | When to use |
|---|---|---|
| Workspace | `ImmersiveBottomSheet` (`variant="workspace"`) | Focused text/numeric input (Field Editor, future notes) |
| Calendar | `DatePickerBottomSheet` | All date selection |
| Search / Picker | `SearchBottomSheet` | Searchable lists, institution pickers, account pickers |
| Editable field | `EditableField` + Field Editor provider | Form fields that accept keyboard input |
| Confirmation | `ConfirmationBottomSheet` | Destructive / irreversible confirms only |

If none apply → propose a new Foundation pattern **before** implementation.

---

## 1. Immersive Bottom Sheets

All immersive experiences use shared infrastructure:

- `ImmersiveBottomSheet`
- `SCREEN_HEADER_*` tokens from `screen-header.tsx`
- `BOTTOM_SHEET_*` chrome from `bottom-sheet-chrome.tsx`
- Shared backdrop, safe-area handling, motion

**Do not** create custom sheet implementations.

### Height tokens

| Experience | Token | Location |
|---|---|---|
| Field Editor (workspace) | `IMMERSIVE_SHEET_HEIGHT` | `lib/layout/immersive-sheet.ts` |
| Date picker | `DATE_PICKER_SHEET_HEIGHT` | `lib/layout/date-picker-sheet.ts` |
| Search / picker | `SEARCH_SHEET_HEIGHT` | `lib/layout/search-sheet.ts` |

---

## 2. Workspace Sheets

Focused user input → `ImmersiveBottomSheet` with `variant="workspace"`.

**Rules:**

- Underlying page locked (`useModalLayerLock` + `useImmersiveWorkspaceLock`)
- Underlying form locked (`html[data-modal-open]` → `[data-app-scroll]` frozen)
- Document scroll locked (`html[data-immersive-workspace]`)
- Sheet container fixed — no drag, no resize
- Keyboard interacts only with the workspace
- Body `overflow-hidden` for typical short fields

**Examples:** Field Editor, future rich text / note editing.

---

## 3. Search Sheets

Search-based pickers → `SearchBottomSheet`.

**Rules:**

- Fixed sheet height (`SEARCH_SHEET_HEIGHT`)
- Keyboard opens inside the sheet only (auto-focus search input)
- Underlying page frozen (modal + workspace lock)
- Sheet container fixed — never shifts with keyboard
- Only the results area scrolls (`data-sheet-scroll`)
- Keyboard inset applied to results padding via `useVisualViewportKeyboardInset`
- Backdrop tap dismisses (no save — selection is immediate on row tap)

**Examples:** Institution picker (current account, wallet, certificate), interest destination picker, future searchable pickers.

---

## 4. Date Picker

All date selection → `DatePickerBottomSheet`.

- Immersive calendar with fixed content height (`DATE_PICKER_SHEET_HEIGHT`)
- Draft state inside sheet; **Save** commits, **Back** / backdrop discards
- Month grid + month/year wheel picker
- No alternate date picker implementations

Trigger: `DateField` only — never native date inputs on form screens.

---

## 5. Editable Fields

All editable form fields → `EditableField` (Field Editor pattern).

**Excluded (existing interaction models):**

- Search fields inside `SearchBottomSheet`
- Dropdown / picker triggers (institution, interest destination, date, chips)
- Authentication credential screens
- Institution custom name inline `Input` (Other institution — documented exception)

No inline keyboard editing outside these rules.

---

## 6. Save / Discard Semantics

| Action | Behavior |
|---|---|
| **Save** | Explicit save; updates canonical form state |
| **Back** | Discards draft |
| **Backdrop** | Same as Back |

No confirmation dialogs for discard. No alternative semantics.

Applies to: Field Editor, Date Picker. Search pickers select immediately on row tap (no draft).

---

## 7. Keyboard Ownership

The active immersive surface owns the keyboard.

**Rules:**

- No page scrolling behind sheets
- No layout shifts on underlying form
- No viewport reconciliation hacks
- No screen-specific keyboard fixes

---

## 8. Shared Tokens

All immersive experiences inherit from `screen-header.tsx` and layout tokens — no duplicated values, no local overrides for:

- Header typography (`SCREEN_HEADER_TITLE_CLASS`)
- Icon sizes (`SCREEN_HEADER_ICON_CLASS`, `SCREEN_HEADER_ACTION_ICON_CLASS`)
- Touch targets (`size-11` header actions)
- Safe areas (`env(safe-area-inset-*)`)
- RTL (chevron rotation, flex direction)
- Motion (`BOTTOM_SHEET_ENTER_CLASS`)

---

## Audit status (v1 freeze)

| Surface | Pattern | Status |
|---|---|---|
| Field Editor | Workspace | ✅ Aligned |
| Date Picker | Calendar | ✅ Aligned |
| Institution picker (all account types) | Search | ✅ Aligned |
| Interest destination picker | Search | ✅ Aligned |
| Confirmation / discard dialogs | Confirmation | ✅ Separate pattern (intentional) |
| Auth screens | — | ✅ Excluded |
| Institution "Other" custom name | Inline input | ⚠️ Documented exception |

---

## Governance checklist

When adding a new form field or sheet:

1. Identify the Foundation pattern
2. Reuse the existing component — do not fork
3. Use shared layout tokens for sizing
4. Use shared header tokens for chrome
5. If deviating, add a row to the audit table above with justification

**Foundation is frozen.** All future screens inherit from it.
