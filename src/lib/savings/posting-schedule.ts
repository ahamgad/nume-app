import type { SavingsPostingFrequency } from "@/lib/savings/types";
import type { TranslationKey } from "@/lib/i18n";

/** Stored DB value for "last day of month". */
export const POSTING_DAY_LAST_OF_MONTH = 0;

export const POSTING_DAY_FORM_LAST = "last_day";

/** Period length in months for simple-interest formula. */
export function periodLengthMonths(frequency: SavingsPostingFrequency): number {
  switch (frequency) {
    case "monthly":
      return 1;
    case "quarterly":
      return 3;
    case "semi_annual":
      return 6;
    case "annual":
      return 12;
  }
}

export function isLastDayOfMonthPosting(postingDay: number): boolean {
  return postingDay === POSTING_DAY_LAST_OF_MONTH;
}

export function parsePostingDayFromForm(value: string): number | null {
  if (value === POSTING_DAY_FORM_LAST) return POSTING_DAY_LAST_OF_MONTH;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 28) return null;
  return parsed;
}

export function postingDayToFormValue(postingDay: number): string {
  return isLastDayOfMonthPosting(postingDay)
    ? POSTING_DAY_FORM_LAST
    : String(postingDay);
}

export function formatPostingDayLabel(
  postingDay: number,
  t: (key: TranslationKey) => string,
): string {
  return isLastDayOfMonthPosting(postingDay)
    ? t("savings.fields.postingDay.lastOfMonth")
    : String(postingDay);
}

function clampCalendarDay(day: number): number {
  return Math.min(28, Math.max(1, Math.round(day)));
}

function toDate(isoDate: string): Date {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function lastDayOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function setPostingDayOnMonth(base: Date, postingDay: number): Date {
  if (isLastDayOfMonthPosting(postingDay)) {
    return lastDayOfMonth(base);
  }
  const day = clampCalendarDay(postingDay);
  const result = new Date(base.getFullYear(), base.getMonth(), day);
  if (result.getMonth() !== base.getMonth()) {
    return lastDayOfMonth(base);
  }
  return result;
}

function addMonths(date: Date, months: number): Date {
  const targetMonth = date.getMonth() + months;
  const targetYear = date.getFullYear() + Math.floor(targetMonth / 12);
  const normalizedMonth = ((targetMonth % 12) + 12) % 12;
  const monthLastDay = new Date(targetYear, normalizedMonth + 1, 0).getDate();
  const day = Math.min(date.getDate(), monthLastDay);
  return new Date(targetYear, normalizedMonth, day);
}

/**
 * First posting date on or after cycle start.
 */
export function calculateInitialNextPostingDate(
  cycleStartDate: string,
  frequency: SavingsPostingFrequency,
  postingDay: number,
): string {
  const start = toDate(cycleStartDate);
  let candidate = setPostingDayOnMonth(start, postingDay);
  if (candidate < start) {
    candidate = setPostingDayOnMonth(
      addMonths(start, periodLengthMonths(frequency)),
      postingDay,
    );
  }
  return toIsoDate(candidate);
}

/** Next posting date strictly after the given posting date. */
export function calculateNextPostingDateAfter(
  lastPostingDate: string,
  frequency: SavingsPostingFrequency,
  postingDay: number,
): string {
  const base = addMonths(toDate(lastPostingDate), periodLengthMonths(frequency));
  return toIsoDate(setPostingDayOnMonth(base, postingDay));
}

export function isPostingDue(
  nextPostingDate: string | null,
  today: string,
): boolean {
  if (!nextPostingDate) return false;
  return nextPostingDate <= today;
}
