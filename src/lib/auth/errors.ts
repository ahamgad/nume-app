export type AuthErrorCode =
  | "invalidCredentials"
  | "emailInUse"
  | "weakPassword"
  | "noEmail"
  | "notConfigured"
  | "callbackFailed"
  | "generic";

export function mapSupabaseAuthError(message: string | undefined): AuthErrorCode {
  if (!message) {
    return "generic";
  }

  const normalized = message.toLowerCase();

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
