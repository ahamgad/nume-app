import type { TranslationKey } from "@/lib/i18n";

export type AuthErrorCode =
  | "invalidCredentials"
  | "emailInUse"
  | "emailNotConfirmed"
  | "weakPassword"
  | "samePassword"
  | "emailSendRateLimit"
  | "callbackFailed"
  | "generic";

export type MappedAuthError = {
  code: AuthErrorCode;
  retryAfterSeconds?: number;
};

export function authError(
  code: AuthErrorCode,
  retryAfterSeconds?: number,
): MappedAuthError {
  return retryAfterSeconds !== undefined
    ? { code, retryAfterSeconds }
    : { code };
}

/** Extracts remaining cooldown seconds from Supabase rate-limit messages. */
export function parseEmailRateLimitSeconds(
  message: string | undefined,
): number | undefined {
  if (!message) {
    return undefined;
  }
  const match = message.match(/after\s+(\d+)\s+seconds?/i);
  if (!match) {
    return undefined;
  }
  const seconds = Number(match[1]);
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return undefined;
  }
  return seconds;
}

type Translate = (
  key: TranslationKey,
  params?: Record<string, string | number>,
) => string;

/** Formats rate-limit copy from remaining seconds; falls back when unknown. */
export function formatEmailSendRateLimitMessage(
  t: Translate,
  retryAfterSeconds?: number,
): string {
  if (retryAfterSeconds === undefined || retryAfterSeconds <= 0) {
    return t("auth.errors.emailSendRateLimit");
  }

  if (retryAfterSeconds <= 60) {
    return retryAfterSeconds === 1
      ? t("auth.errors.emailSendRateLimitRetrySecond", {
          count: retryAfterSeconds,
        })
      : t("auth.errors.emailSendRateLimitRetrySeconds", {
          count: retryAfterSeconds,
        });
  }

  const minutes = Math.max(1, Math.round(retryAfterSeconds / 60));
  return minutes === 1
    ? t("auth.errors.emailSendRateLimitRetryMinute", { count: minutes })
    : t("auth.errors.emailSendRateLimitRetryMinutes", { count: minutes });
}

function isEmailSendRateLimit(
  code: string | undefined,
  normalizedMessage: string,
): boolean {
  if (code === "over_email_send_rate_limit") {
    return true;
  }

  return (
    normalizedMessage.includes("over_email_send_rate_limit") ||
    (normalizedMessage.includes("for security purposes") &&
      normalizedMessage.includes("request this after")) ||
    (normalizedMessage.includes("only request this after") &&
      normalizedMessage.includes("second"))
  );
}

export function mapSupabaseAuthError(
  error:
    | {
        message?: string;
        code?: string;
      }
    | string
    | undefined,
): MappedAuthError {
  const message = typeof error === "string" ? error : error?.message;
  const code = typeof error === "string" ? undefined : error?.code;
  const normalized = message?.toLowerCase() ?? "";

  if (code === "email_not_confirmed") {
    return authError("emailNotConfirmed");
  }

  if (code === "same_password") {
    return authError("samePassword");
  }

  if (isEmailSendRateLimit(code, normalized)) {
    return authError("emailSendRateLimit", parseEmailRateLimitSeconds(message));
  }

  if (!message) {
    return authError("generic");
  }

  if (normalized.includes("email not confirmed")) {
    return authError("emailNotConfirmed");
  }

  if (
    normalized.includes("same_password") ||
    (normalized.includes("new password") &&
      normalized.includes("different") &&
      normalized.includes("old password"))
  ) {
    return authError("samePassword");
  }

  if (normalized.includes("invalid login credentials")) {
    return authError("invalidCredentials");
  }

  if (
    normalized.includes("user already registered") ||
    normalized.includes("already been registered")
  ) {
    return authError("emailInUse");
  }

  if (
    normalized.includes("password") &&
    (normalized.includes("short") ||
      normalized.includes("least") ||
      normalized.includes("characters"))
  ) {
    return authError("weakPassword");
  }

  return authError("generic");
}

export const SESSION_EXPIRED_STORAGE_KEY = "nume:sessionExpired";
