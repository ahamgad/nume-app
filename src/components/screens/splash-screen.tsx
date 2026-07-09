"use client";

import { useEffect, useRef, useState } from "react";
import type { EmailOtpType } from "@supabase/supabase-js";

import {
  getSplashExitDelayMs,
  isSplashInitializationReady,
} from "@/lib/app/splash-session";
import { readStoredLocale } from "@/lib/i18n/locale-restart";
import { getLocaleAttributes } from "@/lib/fonts";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/providers/auth-provider";
import { useFinance } from "@/lib/finance/store";
import { useSplashOverlay } from "@/providers/splash-overlay-provider";

export function SplashScreen() {
  const { beginSplash, setCanStartCurtain, state } = useSplashOverlay();
  const { isLoading: authLoading, user } = useAuth();
  const { isFinanceReady } = useFinance();
  const startedAtRef = useRef(0);
  const splashStartedRef = useRef(false);
  const [initGateOpen, setInitGateOpen] = useState(false);
  const [reducedMotion] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const logoFadeComplete = state.active ? state.logoFadeComplete : reducedMotion;

  useEffect(() => {
    if (splashStartedRef.current) return;
    splashStartedRef.current = true;
    beginSplash({ reducedMotion });
  }, [beginSplash, reducedMotion]);

  useEffect(() => {
    startedAtRef.current = Date.now();
    const locale = readStoredLocale();
    const { lang, dir } = getLocaleAttributes(locale);
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    document.documentElement.dataset.locale = locale;
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const tokenHash = params.get("token_hash");
    const type = params.get("type");
    if (!code && !(tokenHash && type)) return;

    const supabase = createClient();

    void (async () => {
      const { error } = code
        ? await supabase.auth.exchangeCodeForSession(code)
        : await supabase.auth.verifyOtp({
            token_hash: tokenHash ?? "",
            // Supabase EmailOtpType is a string union; keep runtime permissive.
            type: type as EmailOtpType,
          });

      if (error) {
        // Keep existing UX: show callback error on login.
        window.location.assign("/login?error=auth_callback");
        return;
      }

      // Remove one-time tokens from the URL after success.
      window.history.replaceState(null, "", "/splash");
    })();
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

  useEffect(() => {
    setCanStartCurtain(initGateOpen);
  }, [initGateOpen, setCanStartCurtain]);

  return null;
}
