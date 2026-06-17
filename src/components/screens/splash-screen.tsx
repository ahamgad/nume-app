"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import {
  getSplashExitDelayMs,
  isSplashInitializationReady,
  markSplashComplete,
  SPLASH_EXIT_ANIMATION_MS,
} from "@/lib/app/splash-session";
import { readStoredLocale } from "@/lib/i18n/locale-restart";
import { getLocaleAttributes } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";
import { useFinance } from "@/lib/finance/store";

/** N stroke paths — bottom legs draw inward and meet at the top center. */
const NUME_N_STROKE_LEFT = "M16.13 75 L32.2 25 L39.29 25";
const NUME_N_STROKE_RIGHT = "M30.29 75 L46.37 25 L39.29 25";

/** Mirrored pair — top legs draw inward and meet at the bottom center. */
const NUME_N_STROKE_END_LEFT = "M32.2 25 L16.13 75 L23.21 75";
const NUME_N_STROKE_END_RIGHT = "M46.37 25 L30.29 75 L23.21 75";

function SplashRevealVisual({ isExiting }: { isExiting: boolean }) {
  return (
    <div
      className={cn(
        "nume-splash-stage flex flex-col items-center",
        isExiting && "nume-splash-stage-exiting",
      )}
    >
      <div className="relative flex size-[5.5rem] items-center justify-center">
        <svg
          aria-hidden
          viewBox="0 0 100 100"
          className="nume-splash-n-stroke pointer-events-none absolute inset-0 size-full text-foreground"
        >
          <path
            d={NUME_N_STROKE_LEFT}
            pathLength="100"
            className="nume-splash-n-stroke-path"
          />
          <path
            d={NUME_N_STROKE_RIGHT}
            pathLength="100"
            className="nume-splash-n-stroke-path"
          />
          <path
            d={NUME_N_STROKE_END_LEFT}
            pathLength="100"
            className="nume-splash-n-stroke-path"
          />
          <path
            d={NUME_N_STROKE_END_RIGHT}
            pathLength="100"
            className="nume-splash-n-stroke-path"
          />
        </svg>

        <div className="nume-splash-logo-full relative size-full">
          <Image
            src="/brand-flatten-black.svg"
            alt="NUME"
            width={88}
            height={88}
            priority
            className="relative z-0 size-full dark:hidden"
          />
          <Image
            src="/brand-flatten-white.svg"
            alt=""
            width={88}
            height={88}
            priority
            aria-hidden
            className="relative z-0 hidden size-full dark:block"
          />
        </div>
      </div>

      <p
        aria-hidden
        className="nume-splash-wordmark mt-1 text-xl font-semibold tracking-[0.24em] text-foreground"
      >
        NUME
      </p>
    </div>
  );
}

export function SplashScreen() {
  const router = useRouter();
  const { isLoading: authLoading, user } = useAuth();
  const { isFinanceReady } = useFinance();
  const startedAtRef = useRef(0);
  const navigatedRef = useRef(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    startedAtRef.current = Date.now();
    const locale = readStoredLocale();
    const { lang, dir } = getLocaleAttributes(locale);
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    document.documentElement.dataset.locale = locale;
  }, []);

  useEffect(() => {
    if (navigatedRef.current || isExiting) return;
    if (
      !isSplashInitializationReady({
        authLoading,
        user,
        isFinanceReady,
      })
    ) {
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const elapsed = Date.now() - startedAtRef.current;
    const remaining = getSplashExitDelayMs(elapsed, prefersReducedMotion);

    const timer = window.setTimeout(() => {
      setIsExiting(true);
    }, remaining);

    return () => window.clearTimeout(timer);
  }, [authLoading, isExiting, isFinanceReady, user]);

  useEffect(() => {
    if (!isExiting || navigatedRef.current) return;

    const timer = window.setTimeout(() => {
      if (navigatedRef.current) return;
      navigatedRef.current = true;
      markSplashComplete();
      router.replace("/");
    }, SPLASH_EXIT_ANIMATION_MS);

    return () => window.clearTimeout(timer);
  }, [isExiting, router]);

  return (
    <div className="flex h-dvh flex-col items-center justify-center bg-background px-6">
      <SplashRevealVisual isExiting={isExiting} />
    </div>
  );
}
