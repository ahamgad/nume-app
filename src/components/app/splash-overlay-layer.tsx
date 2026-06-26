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
  const handoffPendingRef = useRef(false);

  const dismissAfterAppPaint = useCallback(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        dismissSplash();
        handoffPendingRef.current = false;
      });
    });
  }, [dismissSplash]);

  const handleCurtainComplete = useCallback(() => {
    if (handoffPendingRef.current) return;
    handoffPendingRef.current = true;
    markSplashHandoff();
    markSplashComplete();
    router.replace("/");
  }, [router]);

  useEffect(() => {
    if (!handoffPendingRef.current || pathname !== "/") return;
    dismissAfterAppPaint();
  }, [dismissAfterAppPaint, pathname]);

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
