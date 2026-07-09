export type AuthErrorCode =
  | "invalidCredentials"
  | "emailInUse"
  | "emailNotConfirmed"
  | "weakPassword"
  | "samePassword"
  | "emailSendRateLimit"
  | "callbackFailed"
  | "generic";

export function mapSupabaseAuthError(
  error:
    | {
        message?: string;
        code?: string;
      }
    | string
    | undefined,
): AuthErrorCode {
  const message = typeof error === "string" ? error : error?.message;
  const code = typeof error === "string" ? undefined : error?.code;

  if (code === "email_not_confirmed") {
    return "emailNotConfirmed";
  }

  if (code === "same_password") {
    return "samePassword";
  }

  if (code === "over_email_send_rate_limit") {
    return "emailSendRateLimit";
  }

  if (!message) {
    return "generic";
  }

  const normalized = message.toLowerCase();

  if (normalized.includes("email not confirmed")) {
    return "emailNotConfirmed";
  }

  if (
    normalized.includes("same_password") ||
    (normalized.includes("new password") &&
      normalized.includes("different") &&
      normalized.includes("old password"))
  ) {
    return "samePassword";
  }

  if (
    normalized.includes("over_email_send_rate_limit") ||
    (normalized.includes("for security purposes") &&
      normalized.includes("request this after")) ||
    (normalized.includes("only request this after") &&
      normalized.includes("second"))
  ) {
    return "emailSendRateLimit";
  }

  if (normalized.includes("invalid login credentials")) {
    return "invalidCredentials";
  }

  if (
    normalized.includes("user already registered") ||
    normalized.includes("already been registered")
  ) {
    return "emailInUse";
  }

  if (
    normalized.includes("password") &&
    (normalized.includes("short") ||
      normalized.includes("least") ||
      normalized.includes("characters"))
  ) {
    return "weakPassword";
  }

  return "generic";
}

export const SESSION_EXPIRED_STORAGE_KEY = "nume:sessionExpired";
