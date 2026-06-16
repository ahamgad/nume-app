import type { BusinessDaySettings, DailyBusinessDayContext } from "@/lib/business-days/types";

const MS_PER_DAY = 86_400_000;

function parseIsoDate(isoDate: string): Date {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function formatIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function addCalendarDays(isoDate: string, days: number): string {
  const date = parseIsoDate(isoDate);
  date.setUTCDate(date.getUTCDate() + days);
  return formatIsoDate(date);
}

/** Egypt-first weekend: Friday and Saturday. */
export function isEgyptianWeekend(isoDate: string): boolean {
  const day = parseIsoDate(isoDate).getUTCDay();
  return day === 5 || day === 6;
}

export function usesBusinessDayRules(settings: BusinessDaySettings): boolean {
  return settings.excludeWeekends || settings.excludeEgyptianHolidays;
}

export function isEligibleDailyPayoutDate(
  isoDate: string,
  settings: BusinessDaySettings,
  observedHolidayDates: ReadonlySet<string>,
): boolean {
  if (!usesBusinessDayRules(settings)) {
    return true;
  }
  if (settings.excludeWeekends && isEgyptianWeekend(isoDate)) {
    return false;
  }
  if (settings.excludeEgyptianHolidays && observedHolidayDates.has(isoDate)) {
    return false;
  }
  return true;
}

/** First eligible daily payout date strictly after referenceDate. */
export function firstEligibleDailyPayoutDateAfter(
  referenceDate: string,
  settings: BusinessDaySettings,
  observedHolidayDates: ReadonlySet<string>,
): string {
  let candidate = addCalendarDays(referenceDate, 1);
  let guard = 0;
  const maxGuard = Math.max(
    4000,
    Math.ceil(
      (parseIsoDate(addCalendarDays(referenceDate, 4000)).getTime() -
        parseIsoDate(referenceDate).getTime()) /
        MS_PER_DAY,
    ),
  );

  while (
    !isEligibleDailyPayoutDate(candidate, settings, observedHolidayDates) &&
    guard < maxGuard
  ) {
    candidate = addCalendarDays(candidate, 1);
    guard += 1;
  }

  return candidate;
}

export function nextEligibleDailyPayoutDateAfter(
  lastPayoutDate: string,
  settings: BusinessDaySettings,
  observedHolidayDates: ReadonlySet<string>,
): string {
  return firstEligibleDailyPayoutDateAfter(
    lastPayoutDate,
    settings,
    observedHolidayDates,
  );
}

/** Eligible daily payout dates from the day after startExclusive through endInclusive. */
export function iterateEligibleDailyPayoutDates(
  startExclusive: string,
  endInclusive: string,
  settings: BusinessDaySettings,
  observedHolidayDates: ReadonlySet<string>,
): string[] {
  if (!usesBusinessDayRules(settings)) {
    const dates: string[] = [];
    let candidate = addCalendarDays(startExclusive, 1);
    let guard = 0;
    while (candidate <= endInclusive && guard < 4000) {
      dates.push(candidate);
      candidate = addCalendarDays(candidate, 1);
      guard += 1;
    }
    return dates;
  }

  const dates: string[] = [];
  let candidate = firstEligibleDailyPayoutDateAfter(
    startExclusive,
    settings,
    observedHolidayDates,
  );
  let guard = 0;

  while (candidate <= endInclusive && guard < 4000) {
    dates.push(candidate);
    candidate = firstEligibleDailyPayoutDateAfter(
      candidate,
      settings,
      observedHolidayDates,
    );
    guard += 1;
  }

  return dates;
}

export function buildDailyBusinessDayContext(
  settings: BusinessDaySettings,
  observedHolidayDates: ReadonlySet<string> = new Set(),
): DailyBusinessDayContext {
  return { settings, observedHolidayDates };
}

export function emptyHolidaySet(): ReadonlySet<string> {
  return new Set<string>();
}
