const PENDING_VERIFICATION_EMAIL_KEY = "nume:pendingVerificationEmail";

export function setPendingVerificationEmail(email: string) {
  if (typeof window === "undefined") {
    return;
  }
  sessionStorage.setItem(PENDING_VERIFICATION_EMAIL_KEY, email);
}

export function getPendingVerificationEmail() {
  if (typeof window === "undefined") {
    return null;
  }
  return sessionStorage.getItem(PENDING_VERIFICATION_EMAIL_KEY);
}

export function clearPendingVerificationEmail() {
  if (typeof window === "undefined") {
    return;
  }
  sessionStorage.removeItem(PENDING_VERIFICATION_EMAIL_KEY);
}
