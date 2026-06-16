"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

import {
  getSplashAnimationDurationMs,
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

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const animationMs = getSplashAnimationDurationMs(prefersReducedMotion);
    const elapsed = Date.now() - startedAtRef.current;
    const remaining = Math.max(0, animationMs - elapsed);

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
      <div className="flex flex-col items-center">
        <div className="relative flex size-[6.5rem] items-center justify-center animate-nume-splash-logo-arrival">
          <svg
            aria-hidden
            viewBox="0 0 100 100"
            className="nume-splash-orbit pointer-events-none absolute inset-0 size-full"
          >
            <circle
              cx="50"
              cy="50"
              r="44"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              className="nume-splash-orbit-track"
            />
            <circle
              cx="50"
              cy="50"
              r="44"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              pathLength="100"
              className="nume-splash-orbit-arc"
            />
          </svg>

          <div className="relative size-[5.5rem]">
            <Image
              src="/brand-flatten-black.svg"
              alt="NUME"
              width={88}
              height={88}
              priority
              className="relative z-0 dark:hidden"
            />
            <Image
              src="/brand-flatten-white.svg"
              alt=""
              width={88}
              height={88}
              priority
              aria-hidden
              className="relative z-0 hidden dark:block"
            />
          </div>
        </div>

        <p
          aria-hidden
          className="animate-nume-splash-wordmark mt-2.5 text-xl font-semibold tracking-[0.24em] text-foreground"
        >
          NUME
        </p>
      </div>
    </div>
  );
}
