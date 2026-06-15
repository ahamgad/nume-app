<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:foundation-rules -->
# Nume Foundation v1 (frozen)

Foundation interaction patterns are product rules. Read **`docs/FOUNDATION.md`** before implementing any sheet, picker, editable field, or keyboard-adjacent UI.

Quick reference:

- **Workspace input** → `ImmersiveBottomSheet` (`variant="workspace"`) + `EditableField`
- **Date selection** → `DatePickerBottomSheet` + `DateField`
- **Pickers / selection lists** → `PickerBottomSheet` (+ `shouldShowPickerSearch` when > 10 items)
- **Confirmations** → `ConfirmationBottomSheet` (destructive actions only)

Read **`docs/FOUNDATION.md`** for height rules, scrolling, search, and keyboard ownership.

Do not create custom sheet implementations. Do not inline keyboard editing on form screens.
<!-- END:foundation-rules -->
