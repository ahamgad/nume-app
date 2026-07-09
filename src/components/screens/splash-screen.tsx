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

const AUTH_DEBUG_PREFIX = "[AUTH-VERIFY]";

function authDebugLog(...args: unknown[]) {
  // Temporary runtime trace for verification flow.
  console.info(AUTH_DEBUG_PREFIX, ...args);
}

function authDebugError(...args: unknown[]) {
  console.error(AUTH_DEBUG_PREFIX, ...args);
}

type SupabaseErrorShape = { code?: string; message?: string } | null | undefined;

type VerificationResultShape = {
  error: SupabaseErrorShape;
  data?: {
    session?: unknown;
    user?: { email_confirmed_at?: string | null } | null;
  };
};

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
    if (!code && !(tokenHash && type)) {
      authDebugLog("No verification params on /splash", {
        pathname: window.location.pathname,
        search: window.location.search,
      });
      return;
    }

    const supabase = createClient();

    void (async () => {
      const startedAt = Date.now();
      const path = code ? "exchangeCodeForSession" : "verifyOtp";
      authDebugLog("Verification start", {
        path,
        hasCode: Boolean(code),
        hasTokenHash: Boolean(tokenHash),
        type,
        next: params.get("next"),
        fullSearch: window.location.search,
      });

      const result = code
        ? await supabase.auth.exchangeCodeForSession(code)
        : await supabase.auth.verifyOtp({
            token_hash: tokenHash ?? "",
            // Supabase EmailOtpType is a string union; keep runtime permissive.
            type: type as EmailOtpType,
          });
      const elapsedMs = Date.now() - startedAt;

      const shaped = result as unknown as VerificationResultShape;
      const error = shaped.error;
      const session = shaped.data?.session;
      const resultUser = shaped.data?.user;

      authDebugLog("Verification result", {
        path,
        elapsedMs,
        errorCode: error?.code,
        errorMessage: error?.message,
        hasSession: Boolean(session),
        hasUser: Boolean(resultUser),
        emailConfirmedAt: resultUser?.email_confirmed_at ?? null,
      });

      const sessionResult = await supabase.auth.getSession();
      authDebugLog("Post-verify getSession()", {
        error: sessionResult.error
          ? {
              message: sessionResult.error.message,
              code: (sessionResult.error as unknown as { code?: string }).code,
            }
          : null,
        hasSession: Boolean(sessionResult.data?.session),
        emailConfirmedAt: sessionResult.data?.session?.user?.email_confirmed_at ?? null,
      });

      const userResult = await supabase.auth.getUser();
      authDebugLog("Post-verify getUser()", {
        error: userResult.error
          ? {
              message: userResult.error.message,
              code: (userResult.error as unknown as { code?: string }).code,
            }
          : null,
        hasUser: Boolean(userResult.data?.user),
        emailConfirmedAt: userResult.data?.user?.email_confirmed_at ?? null,
      });

      if (error) {
        authDebugError("Navigation: /login?error=auth_callback (verification failed)", {
          path,
          errorCode: error.code,
          errorMessage: error.message,
        });
        window.location.assign("/login?error=auth_callback");
        return;
      }

      // Remove one-time tokens from the URL after success.
      authDebugLog("Verification succeeded; clearing token params from URL", {
        to: "/splash",
        hadSearch: window.location.search,
      });
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
      authDebugLog("Splash init gate closed", {
        authLoading,
        hasUser: Boolean(user),
        isFinanceReady,
      });
      return;
    }

    const elapsed = Date.now() - startedAtRef.current;
    const remaining = getSplashExitDelayMs(elapsed, reducedMotion);

    authDebugLog("Splash init gate open; scheduling curtain start", {
      elapsedMs: elapsed,
      remainingMs: remaining,
      reducedMotion,
      hasUser: Boolean(user),
    });

    const timer = window.setTimeout(() => {
      authDebugLog("Navigation reason: splash initialization ready (curtain can start)");
      setInitGateOpen(true);
    }, remaining);

    return () => window.clearTimeout(timer);
  }, [authLoading, isFinanceReady, logoFadeComplete, reducedMotion, user]);

  useEffect(() => {
    setCanStartCurtain(initGateOpen);
  }, [initGateOpen, setCanStartCurtain]);

  return null;
}
