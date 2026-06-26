"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";

import { SplashAnimation } from "@/components/screens/splash-animation";
import {
  markSplashComplete,
  markSplashHandoff,
} from "@/lib/app/splash-session";
import { useSplashOverlay } from "@/providers/splash-overlay-provider";

export function SplashOverlayLayer() {
  const router = useRouter();
  const { state, dismissSplash, setLogoFadeComplete } = useSplashOverlay();

  const handleCurtainComplete = useCallback(() => {
    markSplashHandoff();
    markSplashComplete();
    router.replace("/");
    dismissSplash();
  }, [dismissSplash, router]);

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
