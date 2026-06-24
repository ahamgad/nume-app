<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:foundation-rules -->
# Nume Foundation v1 (frozen)

Foundation interaction patterns are **mandatory product rules**. Read **`docs/FOUNDATION.md`** before implementing any screen, sheet, picker, field, header, or copy.

## Frozen foundations registry

All new screens, flows, modules, account types, dialogs, bottom sheets, pickers, and features **must consume** these building blocks. **Do not recreate them inside individual screens.**

| Foundation | Use |
|---|---|
| **Header** | `RootPageHeader`, `StackPageHeader`, `AccountDetailsStackHeader`, `BottomSheetHeader` — page title → content = 24px |
| **Picker list** | `PickerList`, `PickerListOption`, `PickerListDivider`, `PickerListNoneOption` |
| **Account details** | `AccountDetailsStackHeader`, `AccountDetailsContentHeader`, `AccountDetailsSummary` |
| **Create account CTA** | `AccountCreateActionButton` — "Create account" / "Creating account" |
| **Confirmation actions** | `ConfirmationSheetActions` via `ConfirmBottomSheet` / `DiscardDialog` |
| **Typography & copy** | Sentence case, no trailing period on single-sentence helpers — `en.ts`, **`docs/CONTENT.md`** |
| **Numeric typography** | `CurrencyAmount`, `ResponsiveCurrencyAmount`, `formatCurrency` — unified decimal sizing |
| **Inline field editor** | `EditableField`, `FieldEditorBottomSheet`, `FieldEditorSurface` — sync, typography, wrapping, sign chips, unit cleanup, keyboard submit |
| **Account cards** | `AccountCard`, `AccountCardsSection` — Accounts tab list; top row = name + balance + chevron; second row = type · last-4; no dividers |
| **Account picker** | `AccountPicker`, `AccountPickerOptionRow`, `AccountRowContent` — no balances; Institution Picker visual parity; type · last-4 metadata |
| **Account type picker sheet** | `AccountTypePickerSheet`, `AccountTypePickerCard`, `AccountTypePickerSection` — dedicated cards; inherits `CardChevron` |
| **Card surface** | `CARD_SURFACE_CLASS`, `CARD_SURFACE_FLAT_CLASS` — 16px radius, border, no shadow — `lib/layout/card-surface.ts` |
| **Screen canvas** | `bg-background` (`#F7F7F7` light) — `globals.css`; `ScreenBody` bottom padding + pull-to-refresh |
| **Account forms** | `AccountFormSection`, `AccountFormSections`, `AccountFormEditableField` — unified 16px section padding, title inside container, 16px title/field/divider rhythm |
| **Input fields** | `InputField`, `AccountForm*` wrappers — validation-driven `*` via `account-form-required.ts` (identifiers optional; explicit `required={true}` ignored), in-flow errors, EGP/% affixes |

## Interaction patterns

- **Workspace input** → `ImmersiveBottomSheet` (`variant="workspace"`) + `EditableField` + `FieldEditorBottomSheet`
- **Date selection** → `DatePickerBottomSheet` + `DateField`
- **Pickers / selection lists** → `PickerBottomSheet` + `PickerList` (+ `shouldShowPickerSearch` when > 10 items)
- **Optional picker None row** → `PickerListNoneOption` (`picker.none`) — mandatory pickers omit it
- **Confirmations** → `ConfirmationBottomSheet` + `ConfirmationSheetActions`

## Global rules

- **Future screen rule** — every new feature must identify and consume applicable frozen foundations (FOUNDATION § 12)
- **Propagation rule** — fix foundations once; changes propagate to all consumers; no screen-by-screen updates (FOUNDATION § 13)
- **Variant rule** — exceptions require a documented foundation variant, not inline forks (FOUNDATION § 13)

## Prohibited in screen files

- Custom headers, picker list rows, account-details layouts, create-account CTA labels, confirmation button stacks, typography transforms, numeric scaling hacks, field editor behaviors, account card layouts on the Accounts tab, account picker row layouts, account type picker cards, duplicated card-surface chrome, account form section layouts, or input field label/value/error/affix chrome
- Custom screen background colors, scroll bottom padding, or pull-to-refresh outside frozen layout foundations
- Card shadows outside `card-surface.ts`

Read **`docs/FOUNDATION.md`** for full rules, audit table, and documented exceptions.

Read **`docs/CONTENT.md`** for copy conventions.
<!-- END:foundation-rules -->
