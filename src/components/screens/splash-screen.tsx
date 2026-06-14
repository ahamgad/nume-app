"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

import {
  SPLASH_DURATION_MS,
  markSplashComplete,
} from "@/lib/app/splash-session";
import { readStoredLocale } from "@/lib/i18n/locale-restart";
import { getLocaleAttributes } from "@/lib/fonts";
import { useAuth } from "@/providers/auth-provider";
import { useFinance } from "@/lib/finance/store";

export function SplashScreen() {
  const { isLoading: authLoading, user } = useAuth();
  const { isFinanceReady } = useFinance();
  const startedAtRef = useRef(0);
  const navigatedRef = useRef(false);

  useEffect(() => {
    startedAtRef.current = Date.now();
    const locale = readStoredLocale();
    const { lang, dir } = getLocaleAttributes(locale);
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    document.documentElement.dataset.locale = locale;
  }, []);

  useEffect(() => {
    if (navigatedRef.current) return;
    if (authLoading) return;
    if (user && !isFinanceReady) return;

    const elapsed = Date.now() - startedAtRef.current;
    const remaining = Math.max(0, SPLASH_DURATION_MS - elapsed);

    const timer = window.setTimeout(() => {
      if (navigatedRef.current) return;
      navigatedRef.current = true;
      markSplashComplete();
      window.location.replace("/");
    }, remaining);

    return () => window.clearTimeout(timer);
  }, [authLoading, isFinanceReady, user]);

  return (
    <div className="flex h-dvh flex-col items-center justify-center bg-background px-6">
      <div className="animate-nume-splash-pulse">
        <Image
          src="/brand-flatten-black.svg"
          alt="NUME"
          width={88}
          height={88}
          priority
          className="dark:hidden"
        />
        <Image
          src="/brand-flatten-white.svg"
          alt="NUME"
          width={88}
          height={88}
          priority
          className="hidden dark:block"
        />
      </div>
    </div>
  );
}
