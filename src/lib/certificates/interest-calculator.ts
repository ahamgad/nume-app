import type { PayoutFrequency } from "@/lib/certificates/types";

/** Period length in months for simple-interest formula. */
export function periodLengthMonths(frequency: PayoutFrequency): number | null {
  switch (frequency) {
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
    case "instantly":
      return null;
  }
}

/**
 * Simple interest for one schedule period.
 * Formula: (Principal × Annual Rate × Period Length) ÷ 12
 */
export function calculatePeriodInterest(
  principalAmount: number,
  annualInterestRate: number,
  periodMonths: number,
): number {
  if (principalAmount <= 0 || periodMonths <= 0) return 0;
  return roundCurrency(
    (principalAmount * annualInterestRate * periodMonths) / 1200,
  );
}

/** Full-term interest for at-maturity payout. */
export function calculateAtMaturityInterest(
  principalAmount: number,
  annualInterestRate: number,
  termMonths: number,
): number {
  return calculatePeriodInterest(principalAmount, annualInterestRate, termMonths);
}

export function calculateScheduleEntryInterest(
  principalAmount: number,
  annualInterestRate: number,
  payoutFrequency: PayoutFrequency,
  termMonths: number,
): number {
  if (payoutFrequency === "at_maturity" || payoutFrequency === "instantly") {
    return calculateAtMaturityInterest(
      principalAmount,
      annualInterestRate,
      termMonths,
    );
  }

  const periodMonths = periodLengthMonths(payoutFrequency);
  if (periodMonths === null) return 0;

  return calculatePeriodInterest(
    principalAmount,
    annualInterestRate,
    periodMonths,
  );
}

export function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}

export const INTEREST_RECORD_DESCRIPTION = "Certificate Interest";
