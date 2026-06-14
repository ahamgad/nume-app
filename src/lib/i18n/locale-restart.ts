import type { AppLocale } from "@/lib/fonts";

import { clearSplashComplete } from "@/lib/app/splash-session";

export const LOCALE_STORAGE_KEY = "nume-locale";

export function readStoredLocale(): AppLocale {
  if (typeof window === "undefined") return "en";
  const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
  return stored === "ar" ? "ar" : "en";
}

/** Persist locale and cold-restart through splash → dashboard (not previous route). */
export function requestLocaleRestart(next: AppLocale) {
  window.localStorage.setItem(LOCALE_STORAGE_KEY, next);
  clearSplashComplete();
  window.location.assign("/splash");
}
