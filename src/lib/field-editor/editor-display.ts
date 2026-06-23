/**
 * Unit suffixes and prefixes belong on the inline trigger and labels — never in the
 * field editor surface (including beside an empty/placeholder state).
 */
export function stripFieldEditorUnitLabels<
  T extends { prefixLabel?: string; suffixLabel?: string },
>(config: T): T {
  return {
    ...config,
    prefixLabel: undefined,
    suffixLabel: undefined,
  };
}

export { isFieldEditorKeyboardSubmitKey } from "@/lib/field-editor/keyboard-submit";
