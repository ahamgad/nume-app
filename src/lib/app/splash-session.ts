/** Minimum branded splash duration (ms). */
export const SPLASH_DURATION_MS = 900;

/** Background duration before cold-resume splash (ms). */
export const COLD_RESUME_THRESHOLD_MS = 5000;

/** Set when splash finishes; cleared before intentional splash restarts. */
export const SPLASH_COMPLETE_KEY = "nume-splash-complete";

/** Timestamp when the app last entered the background. */
export const BACKGROUND_AT_KEY = "nume-background-at";

export function markSplashComplete() {
  window.sessionStorage.setItem(SPLASH_COMPLETE_KEY, "1");
  window.sessionStorage.removeItem(BACKGROUND_AT_KEY);
}

export function clearSplashComplete() {
  window.sessionStorage.removeItem(SPLASH_COMPLETE_KEY);
}

export function isSplashComplete(): boolean {
  return window.sessionStorage.getItem(SPLASH_COMPLETE_KEY) === "1";
}

export function recordBackgroundTimestamp() {
  window.sessionStorage.setItem(BACKGROUND_AT_KEY, String(Date.now()));
}

export function consumeBackgroundElapsedMs(): number | null {
  const raw = window.sessionStorage.getItem(BACKGROUND_AT_KEY);
  window.sessionStorage.removeItem(BACKGROUND_AT_KEY);
  if (!raw) return null;
  const elapsed = Date.now() - Number(raw);
  return Number.isFinite(elapsed) ? elapsed : null;
}
