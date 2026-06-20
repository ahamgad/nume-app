const ACCOUNT_TYPE_PICKER_DISMISSED_KEY = "nume-account-type-picker-dismissed";

function getSessionStorage() {
  if (typeof globalThis.sessionStorage === "undefined") return null;
  return globalThis.sessionStorage;
}

export function markAccountTypePickerDismissed() {
  getSessionStorage()?.setItem(ACCOUNT_TYPE_PICKER_DISMISSED_KEY, "1");
}

/** True while returning from a picker-driven create flow — suppresses sheet flash on bfcache restore. */
export function shouldSuppressAccountTypePicker(): boolean {
  return getSessionStorage()?.getItem(ACCOUNT_TYPE_PICKER_DISMISSED_KEY) === "1";
}

export function consumeAccountTypePickerDismissed(): boolean {
  const storage = getSessionStorage();
  if (!storage || storage.getItem(ACCOUNT_TYPE_PICKER_DISMISSED_KEY) !== "1") {
    return false;
  }
  storage.removeItem(ACCOUNT_TYPE_PICKER_DISMISSED_KEY);
  return true;
}
