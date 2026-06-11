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

export function formatRelativeTime(
  isoDate: string,
  t: (key: "dashboard.netWorth.justNow") => string,
): string {
  const date = new Date(isoDate);
  const diffMs = Date.now() - date.getTime();
  if (diffMs < 60_000) return t("dashboard.netWorth.justNow");
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return formatDisplayDate(isoDate);
}

export function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export function isFutureDate(isoDate: string): boolean {
  return isoDate > todayIsoDate();
}
