"use client";

import { useEffect } from "react";

import {
  COLD_RESUME_THRESHOLD_MS,
  clearSplashComplete,
  consumeBackgroundElapsedMs,
  recordBackgroundTimestamp,
} from "@/lib/app/splash-session";

/**
 * Shows the official NUME splash after the app was backgrounded ≥ threshold.
 * Quick app switches (< 5s) resume instantly.
 */
export function useColdResumeSplash() {
  useEffect(() => {
    function onVisibilityChange() {
      if (document.visibilityState === "hidden") {
        recordBackgroundTimestamp();
        return;
      }

      if (document.visibilityState !== "visible") return;

      const elapsed = consumeBackgroundElapsedMs();
      if (elapsed === null || elapsed < COLD_RESUME_THRESHOLD_MS) return;

      clearSplashComplete();
      window.location.assign("/splash");
    }

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, []);
}
