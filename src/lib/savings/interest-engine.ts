import { roundCurrency } from "@/lib/certificates/interest-calculator";
import { findTierForBalance } from "@/lib/savings/tier-validation";
import { periodLengthMonths } from "@/lib/savings/posting-schedule";
import type {
  SavingsInterestModel,
  SavingsInterestTier,
  SavingsPostingFrequency,
} from "@/lib/savings/types";

export const SAVINGS_INTEREST_RECORD_DESCRIPTION = "Interest Credit";

/**
 * Simple interest on minimum balance for one posting period.
 * Formula: (Minimum Balance × Annual Rate × Period Months) ÷ 12
 */
export function calculateSavingsInterest(
  minimumBalance: number,
  annualInterestRate: number,
  frequency: SavingsPostingFrequency,
): number {
  const periodMonths = periodLengthMonths(frequency);
  if (minimumBalance <= 0 || periodMonths <= 0 || annualInterestRate <= 0) {
    return 0;
  }
  return roundCurrency(
    (minimumBalance * annualInterestRate * periodMonths) / 1200,
  );
}

export function resolveInterestRate(
  interestModel: SavingsInterestModel,
  fixedRate: number | null,
  tiers: SavingsInterestTier[],
  minimumBalance: number,
): number | null {
  if (interestModel === "fixed") {
    return fixedRate;
  }
  const tier = findTierForBalance(minimumBalance, tiers);
  return tier?.annualInterestRate ?? null;
}
