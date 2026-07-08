"use client";

import type { AuthErrorCode } from "@/lib/auth/errors";
import type { TranslationKey } from "@/lib/i18n";
import { useT } from "@/providers/i18n-provider";

const AUTH_ERROR_KEYS = {
  invalidCredentials: "auth.errors.invalidCredentials",
  emailInUse: "auth.errors.emailInUse",
  weakPassword: "auth.errors.weakPassword",
  generic: "auth.errors.generic",
  callbackFailed: "auth.errors.callbackFailed",
  notConfigured: "auth.errors.notConfigured",
  noEmail: "auth.verify.noEmail",
} as const satisfies Record<AuthErrorCode, TranslationKey>;

export function useAuthErrorMessage() {
  const t = useT();
  return (code: AuthErrorCode) => t(AUTH_ERROR_KEYS[code]);
}
