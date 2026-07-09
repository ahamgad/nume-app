"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";

import { SplashAnimation } from "@/components/screens/splash-animation";
import {
  isSplashHandoffRoute,
  markSplashComplete,
  markSplashHandoff,
} from "@/lib/app/splash-session";
import { useSplashOverlay } from "@/providers/splash-overlay-provider";

export function SplashOverlayLayer() {
  const router = useRouter();
  const pathname = usePathname();
  const { state, dismissSplash, setLogoFadeComplete } = useSplashOverlay();
  const handoffStartedRef = useRef(false);
  const curtainCompletePendingRef = useRef(false);

  const dismissAfterAppPaint = useCallback(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        dismissSplash();
        handoffStartedRef.current = false;
        curtainCompletePendingRef.current = false;
      });
    });
  }, [dismissSplash]);

  const tryDismiss = useCallback(() => {
    if (!handoffStartedRef.current || !curtainCompletePendingRef.current) {
      return;
    }
    if (!isSplashHandoffRoute(pathname)) return;
    dismissAfterAppPaint();
  }, [dismissAfterAppPaint, pathname]);

  useEffect(() => {
    if (!state.active || !state.canStartCurtain || handoffStartedRef.current) {
      return;
    }

    handoffStartedRef.current = true;
    markSplashHandoff();
    markSplashComplete();
  }, [state.active, state.canStartCurtain]);

  const handleCurtainComplete = useCallback(() => {
    curtainCompletePendingRef.current = true;
    // Temporary verification trace: indicates the splash overlay is handing off.
    console.info("[AUTH-VERIFY]", "Splash overlay curtain complete; router.replace('/')");
    router.replace("/");
  }, [router]);

  useEffect(() => {
    tryDismiss();
  }, [tryDismiss]);

  if (!state.active) return null;

  return (
    <SplashAnimation
      canStartCurtain={state.canStartCurtain}
      reducedMotion={state.reducedMotion}
      onLogoFadeComplete={() => setLogoFadeComplete(true)}
      onCurtainComplete={handleCurtainComplete}
    />
  );
}
