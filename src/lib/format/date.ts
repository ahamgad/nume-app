import type { TranslationKey } from "@/lib/i18n";

export function formatDisplayDate(
  isoDate: string,
  locale: string = "en-GB",
): string {
  const date = new Date(isoDate);
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

type RelativeTimeTranslator = (
  key: TranslationKey,
  params?: Record<string, string | number>,
) => string;

export function formatRelativeTime(
  isoDate: string,
  t: RelativeTimeTranslator,
  dateLocale: string = "en-GB",
): string {
  const date = new Date(isoDate);
  const diffMs = Date.now() - date.getTime();
  if (diffMs < 60_000) return t("dashboard.netWorth.justNow");
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 60) {
    return t("common.time.minutesAgo", { count: diffMin });
  }
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) {
    return t("common.time.hoursAgo", { count: diffHours });
  }
  return formatDisplayDate(isoDate, dateLocale);
}

function formatLocalIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Parse an ISO date string as a local calendar date. */
export function parseIsoDate(isoDate: string): Date {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year, month - 1, day);
}

/** Format a local calendar date as ISO YYYY-MM-DD. */
export function toIsoDate(date: Date): string {
  return formatLocalIsoDate(date);
}

/** Today's date in the user's local calendar (matches native date inputs). */
export function todayIsoDate(): string {
  return formatLocalIsoDate(new Date());
}

export function isFutureDate(isoDate: string): boolean {
  return isoDate > todayIsoDate();
}

export function offsetLocalIsoDate(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return formatLocalIsoDate(date);
}
