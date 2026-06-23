/** Debounce window for duplicate keydown/keyup submit events on one press. */
export const FIELD_EDITOR_KEYBOARD_SUBMIT_DEBOUNCE_MS = 300;

/** True when Enter / Return should commit the field editor (same as Save). */
export function isFieldEditorKeyboardSubmitKey(event: {
  key: string;
  shiftKey: boolean;
  keyCode?: number;
}): boolean {
  if (event.shiftKey) return false;
  if (event.key === "Enter") return true;
  // Legacy iOS / Android numeric and accessory keys sometimes omit `key`.
  if (event.keyCode === 13) return true;
  return false;
}

/**
 * Returns true when blur should commit — i.e. keyboard Done on iOS numeric pads
 * (which dismiss via blur without an Enter keydown).
 */
export function shouldFieldEditorSubmitOnBlur(
  discardIntent: boolean,
): boolean {
  return !discardIntent;
}

/**
 * Debounces duplicate keyboard submit signals (keydown + keyup) for one press.
 */
export function createFieldEditorKeyboardSubmitDebouncer(onSubmit: () => void) {
  let lastSubmitAt = -FIELD_EDITOR_KEYBOARD_SUBMIT_DEBOUNCE_MS;

  return function submitFromKeyboard() {
    const now = Date.now();
    if (now - lastSubmitAt < FIELD_EDITOR_KEYBOARD_SUBMIT_DEBOUNCE_MS) {
      return;
    }
    lastSubmitAt = now;
    onSubmit();
  };
}
