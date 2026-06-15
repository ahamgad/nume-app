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

## Audit status (v1 final)

| Surface | Pattern | Status |
|---|---|---|
| Field Editor | Workspace | ✅ |
| Date Picker | Calendar | ✅ |
| Institution picker (all types) | Picker | ✅ |
| Interest destination picker | Picker | ✅ |
| Confirmation / discard | Confirmation | ✅ Intentional |
| Auth screens | — | ✅ Excluded |
| Institution "Other" custom name | Inline input | ⚠️ Documented exception |

---

## Governance checklist

1. Identify the Foundation pattern
2. Reuse the component — do not fork
3. Use shared layout tokens
4. Document any deviation in the audit table

**Foundation v1 is frozen.**
