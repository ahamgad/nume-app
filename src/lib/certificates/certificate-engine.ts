import type {
  CertificateCalculationInput,
  CertificateStatus,
  ComputedCertificateMetrics,
  PayoutFrequency,
} from "@/lib/certificates/types";
import type { TranslationKey } from "@/lib/i18n";
import { todayIsoDate } from "@/lib/format/date";

const MS_PER_DAY = 86_400_000;

function parseIsoDate(isoDate: string): Date {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function formatIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Calendar-month addition with end-of-month clamping (e.g. Jan 31 + 1 → Feb 28/29). */
export function addCalendarMonths(isoDate: string, months: number): string {
  const date = parseIsoDate(isoDate);
  const day = date.getUTCDate();
  const anchor = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
  anchor.setUTCMonth(anchor.getUTCMonth() + months);
  const lastDay = new Date(
    Date.UTC(anchor.getUTCFullYear(), anchor.getUTCMonth() + 1, 0),
  ).getUTCDate();
  anchor.setUTCDate(Math.min(day, lastDay));
  return formatIsoDate(anchor);
}

export function calculateMaturityDate(
  purchaseDate: string,
  termMonths: number,
): string {
  return addCalendarMonths(purchaseDate, termMonths);
}

export function calculateExpectedProfit(
  principalAmount: number,
  annualInterestRate: number,
  termMonths: number,
): number {
  return (
    principalAmount * (annualInterestRate / 100) * (termMonths / 12)
  );
}

export function calculateExpectedTotalReturn(
  principalAmount: number,
  expectedProfit: number,
): number {
  return principalAmount + expectedProfit;
}

/** Per-period interest payout amount (informational — no automation in v1). */
export function calculatePayoutAmount(
  principalAmount: number,
  annualInterestRate: number,
  termMonths: number,
  payoutFrequency: PayoutFrequency,
): number {
  const expectedProfit = calculateExpectedProfit(
    principalAmount,
    annualInterestRate,
    termMonths,
  );

  if (termMonths <= 0) return 0;

  switch (payoutFrequency) {
    case "instantly":
    case "at_maturity":
      return expectedProfit;
    case "monthly":
      return expectedProfit / termMonths;
    case "quarterly":
      return expectedProfit / Math.max(termMonths / 3, 1);
    case "semi_annual":
      return expectedProfit / Math.max(termMonths / 6, 1);
    case "annual":
      return expectedProfit / Math.max(termMonths / 12, 1);
  }
}

export function calculateCurrentValue(
  principalAmount: number,
  status: CertificateStatus,
): number {
  if (
    status === "archived" ||
    status === "closed" ||
    status === "renewed"
  ) {
    return 0;
  }
  return principalAmount;
}

function frequencyStepMonths(frequency: PayoutFrequency): number | null {
  switch (frequency) {
    case "instantly":
      return null;
    case "monthly":
      return 1;
    case "quarterly":
      return 3;
    case "semi_annual":
      return 6;
    case "annual":
      return 12;
    case "at_maturity":
      return null;
  }
}

export function calculateNextPayoutDate(
  purchaseDate: string,
  maturityDate: string,
  payoutFrequency: PayoutFrequency,
  asOfDate: string = todayIsoDate(),
): string | null {
  if (payoutFrequency === "instantly") {
    return purchaseDate;
  }

  if (payoutFrequency === "at_maturity") {
    return maturityDate >= asOfDate ? maturityDate : null;
  }

  const stepMonths = frequencyStepMonths(payoutFrequency);
  if (stepMonths === null) return null;

  let candidate = purchaseDate;
  let guard = 0;
  const maxIterations = 600;

  while (candidate < asOfDate && guard < maxIterations) {
    candidate = addCalendarMonths(candidate, stepMonths);
    guard += 1;
  }

  if (guard >= maxIterations || candidate > maturityDate) {
    return null;
  }

  return candidate;
}

export function calculateRemainingDays(
  maturityDate: string,
  asOfDate: string = todayIsoDate(),
): number {
  const maturity = parseIsoDate(maturityDate).getTime();
  const asOf = parseIsoDate(asOfDate).getTime();
  const diff = Math.ceil((maturity - asOf) / MS_PER_DAY);
  return Math.max(0, diff);
}

function calendarMonthsBetween(fromIso: string, toIso: string): number {
  const from = parseIsoDate(fromIso);
  const to = parseIsoDate(toIso);
  let months =
    (to.getUTCFullYear() - from.getUTCFullYear()) * 12 +
    (to.getUTCMonth() - from.getUTCMonth());
  if (to.getUTCDate() < from.getUTCDate()) {
    months -= 1;
  }
  return Math.max(0, months);
}

export function formatCertificateRemainingLabel(
  maturityDate: string,
  asOfDate: string,
  t: (key: TranslationKey, params?: Record<string, number>) => string,
): string {
  const remainingDays = calculateRemainingDays(maturityDate, asOfDate);

  if (remainingDays <= 30) {
    return remainingDays === 1
      ? t("certificates.details.remainingDayCount")
      : t("certificates.details.remainingDaysCount", { count: remainingDays });
  }

  const months = calendarMonthsBetween(asOfDate, maturityDate);
  if (months >= 12 && months % 12 === 0) {
    const years = months / 12;
    return years === 1
      ? t("certificates.details.remainingYearCount")
      : t("certificates.details.remainingYearsCount", { count: years });
  }

  const displayMonths = Math.max(1, months);
  return displayMonths === 1
    ? t("certificates.details.remainingMonthCount")
    : t("certificates.details.remainingMonthsCount", { count: displayMonths });
}

export function computeCertificateMetrics(
  input: CertificateCalculationInput,
  asOfDate: string = todayIsoDate(),
): ComputedCertificateMetrics {
  const maturityDate =
    input.maturityDate ||
    calculateMaturityDate(input.purchaseDate, input.termMonths);
  const expectedProfit = calculateExpectedProfit(
    input.principalAmount,
    input.annualInterestRate,
    input.termMonths,
  );
  const expectedTotalReturn = calculateExpectedTotalReturn(
    input.principalAmount,
    expectedProfit,
  );
  const currentValue = calculateCurrentValue(
    input.principalAmount,
    input.status,
  );
  const nextPayoutDate = calculateNextPayoutDate(
    input.purchaseDate,
    maturityDate,
    input.payoutFrequency,
    asOfDate,
  );
  const remainingDays = calculateRemainingDays(maturityDate, asOfDate);

  return {
    maturityDate,
    expectedProfit,
    expectedTotalReturn,
    currentValue,
    nextPayoutDate,
    remainingDays,
  };
}
