/** Minimum branded splash duration (ms) before exit when init is ready. */
export const SPLASH_MIN_DURATION_MS = 1000;

/** Splash exit dissolve animation (ms). */
export const SPLASH_EXIT_ANIMATION_MS = 280;

/** Reduced-motion splash minimum (ms). */
export const SPLASH_REDUCED_MOTION_MS = 600;

/** Set when splash finishes for the current browser session. */
export const SPLASH_COMPLETE_KEY = "nume-splash-complete";

/**
 * Set when the app enters the background. Consumed on the next load to
 * distinguish background resume (skip splash) from cold start (show splash).
 */
export const BG_RESUME_ELIGIBLE_KEY = "nume-bg-resume-eligible";

export function getSplashAnimationDurationMs(
  prefersReducedMotion = false,
): number {
  return prefersReducedMotion ? SPLASH_REDUCED_MOTION_MS : SPLASH_MIN_DURATION_MS;
}

export function getSplashExitDelayMs(
  elapsedMs: number,
  prefersReducedMotion = false,
): number {
  const minimum = getSplashAnimationDurationMs(prefersReducedMotion);
  return Math.max(0, minimum - elapsedMs);
}

export function isSplashInitializationReady(options: {
  authLoading: boolean;
  user: unknown;
  isFinanceReady: boolean;
}): boolean {
  if (options.authLoading) return false;
  if (options.user && !options.isFinanceReady) return false;
  return true;
}

export function shouldSkipSplashOnLoad(options: {
  pathname: string;
  splashComplete: boolean;
  bgResumeEligible: boolean;
  wasDiscarded: boolean;
}): boolean {
  if (options.pathname === "/splash") return true;
  if (options.wasDiscarded) return false;
  return options.splashComplete && options.bgResumeEligible;
}

export function markSplashComplete() {
  window.sessionStorage.setItem(SPLASH_COMPLETE_KEY, "1");
  window.sessionStorage.removeItem(BG_RESUME_ELIGIBLE_KEY);
  window.dispatchEvent(new Event("nume-splash-gate"));
}

export function clearSplashComplete() {
  window.sessionStorage.removeItem(SPLASH_COMPLETE_KEY);
  window.sessionStorage.removeItem(BG_RESUME_ELIGIBLE_KEY);
}

export function isSplashComplete(): boolean {
  return window.sessionStorage.getItem(SPLASH_COMPLETE_KEY) === "1";
}

/** Inline bootstrap + lifecycle listeners — runs before first paint. */
export function getSplashBootstrapScript(): string {
  return `(function(){try{
var SPLASH="${SPLASH_COMPLETE_KEY}";
var RESUME="${BG_RESUME_ELIGIBLE_KEY}";
document.addEventListener("visibilitychange",function(){
  if(document.visibilityState==="hidden"){sessionStorage.setItem(RESUME,"1");}
});
window.addEventListener("pagehide",function(e){
  if(!e.persisted){sessionStorage.removeItem(RESUME);}
});
var p=location.pathname;
if(p==="/splash")return;
var complete=sessionStorage.getItem(SPLASH)==="1";
var resume=sessionStorage.getItem(RESUME)==="1";
var discarded=typeof document!=="undefined"&&document.wasDiscarded===true;
if(discarded){
  sessionStorage.removeItem(SPLASH);
  sessionStorage.removeItem(RESUME);
  location.replace("/splash");
  return;
}
if(complete&&resume){
  sessionStorage.removeItem(RESUME);
  return;
}
sessionStorage.removeItem(SPLASH);
sessionStorage.removeItem(RESUME);
location.replace("/splash");
}catch(e){}})();`;
}
