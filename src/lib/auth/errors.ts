export type AuthErrorCode =
  | "invalidCredentials"
  | "emailInUse"
  | "emailNotConfirmed"
  | "weakPassword"
  | "noEmail"
  | "notConfigured"
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

  if (!message) {
    return "generic";
  }

  const normalized = message.toLowerCase();

  if (normalized.includes("email not confirmed")) {
    return "emailNotConfirmed";
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
