"use client";

import {
  formatEmailSendRateLimitMessage,
  type AuthErrorCode,
  type MappedAuthError,
} from "@/lib/auth/errors";
import type { TranslationKey } from "@/lib/i18n";
import { useT } from "@/providers/i18n-provider";

const AUTH_ERROR_KEYS = {
  emailSendRateLimit: "auth.errors.emailSendRateLimit",
  generic: "auth.errors.generic",
} as const satisfies Record<AuthErrorCode, TranslationKey>;

export function useAuthErrorMessage() {
  const t = useT();
  return (error: MappedAuthError | AuthErrorCode) => {
    const mapped = typeof error === "string" ? { code: error } : error;
    if (mapped.code === "emailSendRateLimit") {
      return formatEmailSendRateLimitMessage(t, mapped.retryAfterSeconds);
    }
    return t(AUTH_ERROR_KEYS[mapped.code]);
  };
}
