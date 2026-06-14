import type { AppLocale } from "@/lib/fonts";

export const LOCALE_STORAGE_KEY = "nume-locale";
export const LOCALE_RETURN_PATH_KEY = "nume-locale-return";

export function readStoredLocale(): AppLocale {
  if (typeof window === "undefined") return "en";
  const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
  return stored === "ar" ? "ar" : "en";
}

/** Persist locale and reload through splash so providers rehydrate like an app restart. */
export function requestLocaleRestart(next: AppLocale) {
  window.localStorage.setItem(LOCALE_STORAGE_KEY, next);
  window.sessionStorage.setItem(
    LOCALE_RETURN_PATH_KEY,
    window.location.pathname + window.location.search,
  );
  window.location.assign("/splash");
}
