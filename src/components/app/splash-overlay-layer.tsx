"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";

import { SplashAnimation } from "@/components/screens/splash-animation";
import {
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
    if (pathname !== "/") return;
    dismissAfterAppPaint();
  }, [dismissAfterAppPaint, pathname]);

  const handleCurtainStart = useCallback(() => {
    if (handoffStartedRef.current) return;
    handoffStartedRef.current = true;
    markSplashHandoff();
    markSplashComplete();
    router.replace("/");
  }, [router]);

  const handleCurtainComplete = useCallback(() => {
    curtainCompletePendingRef.current = true;
    tryDismiss();
  }, [tryDismiss]);

  useEffect(() => {
    tryDismiss();
  }, [tryDismiss]);

  if (!state.active) return null;

  return (
    <SplashAnimation
      canStartCurtain={state.canStartCurtain}
      reducedMotion={state.reducedMotion}
      onLogoFadeComplete={() => setLogoFadeComplete(true)}
      onCurtainStart={handleCurtainStart}
      onCurtainComplete={handleCurtainComplete}
    />
  );
}
