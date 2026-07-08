import { SESSION_EXPIRED_STORAGE_KEY } from "@/lib/auth/errors";

export function markSessionExpiredNotice() {
  if (typeof window === "undefined") {
    return;
  }
  sessionStorage.setItem(SESSION_EXPIRED_STORAGE_KEY, "1");
}

export function consumeSessionExpiredNotice() {
  if (typeof window === "undefined") {
    return false;
  }
  const shouldShow = sessionStorage.getItem(SESSION_EXPIRED_STORAGE_KEY) === "1";
  if (shouldShow) {
    sessionStorage.removeItem(SESSION_EXPIRED_STORAGE_KEY);
  }
  return shouldShow;
}
