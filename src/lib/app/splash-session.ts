/** Branded splash animation target (ms). Ends earlier when init is slower. */
export const SPLASH_ANIMATION_MS = 1200;

/** Branded splash animation upper bound (ms). */
export const SPLASH_ANIMATION_MAX_MS = 1400;

/** Reduced-motion splash duration (ms). */
export const SPLASH_REDUCED_MOTION_MS = 400;

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
  return prefersReducedMotion ? SPLASH_REDUCED_MOTION_MS : SPLASH_ANIMATION_MS;
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
