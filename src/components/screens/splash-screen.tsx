"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { SplashAnimation } from "@/components/screens/splash-animation";
import {
  getSplashExitDelayMs,
  isSplashInitializationReady,
  markSplashComplete,
} from "@/lib/app/splash-session";
import { readStoredLocale } from "@/lib/i18n/locale-restart";
import { getLocaleAttributes } from "@/lib/fonts";
import { useAuth } from "@/providers/auth-provider";
import { useFinance } from "@/lib/finance/store";

export function SplashScreen() {
  const router = useRouter();
  const { isLoading: authLoading, user } = useAuth();
  const { isFinanceReady } = useFinance();
  const startedAtRef = useRef(0);
  const navigatedRef = useRef(false);
  const [reducedMotion] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [logoFadeComplete, setLogoFadeComplete] = useState(reducedMotion);
  const [initGateOpen, setInitGateOpen] = useState(false);

  useEffect(() => {
    startedAtRef.current = Date.now();
    const locale = readStoredLocale();
    const { lang, dir } = getLocaleAttributes(locale);
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    document.documentElement.dataset.locale = locale;
  }, []);

  useEffect(() => {
    if (!logoFadeComplete) return;
    if (
      !isSplashInitializationReady({
        authLoading,
        user,
        isFinanceReady,
      })
    ) {
      return;
    }

    const elapsed = Date.now() - startedAtRef.current;
    const remaining = getSplashExitDelayMs(elapsed, reducedMotion);

    const timer = window.setTimeout(() => {
      setInitGateOpen(true);
    }, remaining);

    return () => window.clearTimeout(timer);
  }, [authLoading, isFinanceReady, logoFadeComplete, reducedMotion, user]);

  const handleCurtainComplete = useCallback(() => {
    if (navigatedRef.current) return;
    navigatedRef.current = true;
    markSplashComplete();
    router.replace("/");
  }, [router]);

  return (
    <SplashAnimation
      canStartCurtain={initGateOpen}
      reducedMotion={reducedMotion}
      onLogoFadeComplete={() => setLogoFadeComplete(true)}
      onCurtainComplete={handleCurtainComplete}
    />
  );
}
