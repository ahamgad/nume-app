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

/** True when Enter / Return should commit the field editor (same as Save). */
export function isFieldEditorKeyboardSubmitKey(
  event: Pick<KeyboardEvent, "key" | "shiftKey">,
): boolean {
  if (event.key !== "Enter") return false;
  // Shift+Enter inserts a newline in multi-line text fields.
  if (event.shiftKey) return false;
  return true;
}
