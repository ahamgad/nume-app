<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:foundation-rules -->
# Nume Foundation v1 (frozen)

Foundation interaction patterns are product rules. Read **`docs/FOUNDATION.md`** before implementing any sheet, picker, editable field, keyboard-adjacent UI, or screen header.

Quick reference:

- **Workspace input** → `ImmersiveBottomSheet` (`variant="workspace"`) + `EditableField`
- **Date selection** → `DatePickerBottomSheet` + `DateField`
- **Pickers / selection lists** → `PickerBottomSheet` + `PickerList` (+ `shouldShowPickerSearch` when > 10 items)
- **Optional picker None row** → `PickerListNoneOption` (`picker.none`) — mandatory pickers omit it
- **Confirmations** → `ConfirmationBottomSheet` (destructive actions only)

**Header building blocks (frozen — do not build custom headers in screens):**

- **Tab-root screens** (Dashboard, Accounts, Planning, Goals, More) → `RootPageHeader` + `RootPageTitle`
- **Stack sub-screens** → `StackPageHeader` + `StackPageTitle`
- **Account details** (all account types) → `AccountDetailsStackHeader` + `AccountDetailsContentHeader`
- **Bottom sheets** → `BottomSheetHeader` / `BottomSheetHeaderlessContent` via sheet Foundation wrappers

Read **`docs/FOUNDATION.md`** § 9 for header reuse, propagation, and variant rules.

Read **`docs/FOUNDATION.md`** for height rules, scrolling, search, and keyboard ownership.

Read **`docs/CONTENT.md`** for English sentence-case and copy conventions.

Do not create custom sheet implementations. Do not inline keyboard editing on form screens. Do not implement headers directly in screen files — use the approved header components only. Do not build custom picker list rows — use `PickerList`, `PickerListOption`, and `PickerListNoneOption`.
<!-- END:foundation-rules -->
