"use client";

import { useCallback, useEffect, useState } from "react";

import {
  FALLBACK_EMAIL_SEND_COOLDOWN_SECONDS,
  remainingSecondsUntil,
} from "@/lib/auth/email-send-cooldown";
import { formatEmailSendRateLimitMessage } from "@/lib/auth/errors";
import { useT } from "@/providers/i18n-provider";

/**
 * Live email-send cooldown: counts down from Supabase's remaining time,
 * clears itself at zero, and re-enables the action without another tap.
 */
export function useEmailSendCooldown() {
  const t = useT();
  const [endsAtMs, setEndsAtMs] = useState<number | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [useFallbackCopy, setUseFallbackCopy] = useState(false);

  const clear = useCallback(() => {
    setEndsAtMs(null);
    setRemainingSeconds(0);
    setUseFallbackCopy(false);
  }, []);

  const start = useCallback((retryAfterSeconds?: number) => {
    const hasParsedSeconds =
      retryAfterSeconds !== undefined && retryAfterSeconds > 0;
    const seconds = hasParsedSeconds
      ? retryAfterSeconds
      : FALLBACK_EMAIL_SEND_COOLDOWN_SECONDS;
    const nextEndsAt = Date.now() + seconds * 1000;
    setUseFallbackCopy(!hasParsedSeconds);
    setEndsAtMs(nextEndsAt);
    setRemainingSeconds(seconds);
  }, []);

  useEffect(() => {
    if (endsAtMs === null) {
      return;
    }

    const tick = () => {
      const remaining = remainingSecondsUntil(endsAtMs);
      setRemainingSeconds(remaining);
      if (remaining <= 0) {
        setEndsAtMs(null);
        setUseFallbackCopy(false);
      }
    };

    tick();
    const id = window.setInterval(tick, 250);
    return () => window.clearInterval(id);
  }, [endsAtMs]);

  const isActive = endsAtMs !== null && remainingSeconds > 0;
  const message = !isActive
    ? null
    : useFallbackCopy
      ? t("auth.errors.emailSendRateLimit")
      : formatEmailSendRateLimitMessage(t, remainingSeconds);

  return {
    isActive,
    message,
    remainingSeconds: isActive ? remainingSeconds : 0,
    start,
    clear,
  };
}
