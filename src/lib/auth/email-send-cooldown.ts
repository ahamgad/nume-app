export const FALLBACK_EMAIL_SEND_COOLDOWN_SECONDS = 60;

/** Whole seconds remaining until a cooldown end timestamp. */
export function remainingSecondsUntil(endsAtMs: number, nowMs = Date.now()) {
  return Math.max(0, Math.ceil((endsAtMs - nowMs) / 1000));
}
