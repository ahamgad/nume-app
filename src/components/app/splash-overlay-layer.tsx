"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";

import { SplashAnimation } from "@/components/screens/splash-animation";
import { markSplashComplete } from "@/lib/app/splash-session";
import { useSplashOverlay } from "@/providers/splash-overlay-provider";

export function SplashOverlayLayer() {
  const router = useRouter();
  const {
    state,
    dismissSplash,
    setLogoFadeComplete,
  } = useSplashOverlay();

  const handleCurtainStart = useCallback(() => {
    markSplashComplete();
    router.replace("/");
  }, [router]);

  const handleCurtainComplete = useCallback(() => {
    dismissSplash();
  }, [dismissSplash]);

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
