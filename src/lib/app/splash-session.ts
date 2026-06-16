/** Branded splash animation target (ms). Ends earlier when init is slower. */
export const SPLASH_ANIMATION_MS = 1200;

/** Branded splash animation upper bound (ms). */
export const SPLASH_ANIMATION_MAX_MS = 1400;

/** Reduced-motion splash duration (ms). */
export const SPLASH_REDUCED_MOTION_MS = 400;

/** Show splash again after this much inactivity (ms). */
export const INACTIVITY_SPLASH_THRESHOLD_MS = 3 * 24 * 60 * 60 * 1000;

/** Set when splash finishes or is skipped for the current browser session. */
export const SPLASH_COMPLETE_KEY = "nume-splash-complete";

/** Last successful app launch (localStorage, survives cold starts). */
export const LAST_OPENED_AT_KEY = "nume-last-opened-at";

export function shouldShowSplashOnColdStart(
  lastOpenedAtMs: number | null,
  nowMs: number,
): boolean {
  if (lastOpenedAtMs === null) return true;
  if (!Number.isFinite(lastOpenedAtMs)) return true;
  return nowMs - lastOpenedAtMs >= INACTIVITY_SPLASH_THRESHOLD_MS;
}

export function getSplashAnimationDurationMs(
  prefersReducedMotion = false,
): number {
  return prefersReducedMotion ? SPLASH_REDUCED_MOTION_MS : SPLASH_ANIMATION_MS;
}

export function markSplashComplete(now = Date.now()) {
  window.sessionStorage.setItem(SPLASH_COMPLETE_KEY, "1");
  recordLastOpenedAt(now);
}

export function skipSplashForActiveSession(now = Date.now()) {
  window.sessionStorage.setItem(SPLASH_COMPLETE_KEY, "1");
  recordLastOpenedAt(now);
}

export function clearSplashComplete() {
  window.sessionStorage.removeItem(SPLASH_COMPLETE_KEY);
}

export function isSplashComplete(): boolean {
  return window.sessionStorage.getItem(SPLASH_COMPLETE_KEY) === "1";
}

export function readLastOpenedAtMs(): number | null {
  const raw = window.localStorage.getItem(LAST_OPENED_AT_KEY);
  if (!raw) return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

export function recordLastOpenedAt(now = Date.now()) {
  window.localStorage.setItem(LAST_OPENED_AT_KEY, String(now));
}

/** Inline bootstrap script — runs before first paint on cold loads. */
export function getSplashBootstrapScript(): string {
  return `(function(){try{var p=location.pathname;if(p==="/splash")return;if(sessionStorage.getItem("${SPLASH_COMPLETE_KEY}")==="1")return;var last=localStorage.getItem("${LAST_OPENED_AT_KEY}");var now=Date.now();var threshold=${INACTIVITY_SPLASH_THRESHOLD_MS};if(last&&Number.isFinite(Number(last))&&(now-Number(last))<threshold){sessionStorage.setItem("${SPLASH_COMPLETE_KEY}","1");localStorage.setItem("${LAST_OPENED_AT_KEY}",String(now));return;}location.replace("/splash");}catch(e){}})();`;
}
