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
  if (minimumBalance <= 0 || annualInterestRate <= 0) {
    return 0;
  }

  if (frequency === "daily") {
    return roundCurrency(
      (minimumBalance * annualInterestRate) / 36500,
    );
  }

  const periodMonths = periodLengthMonths(frequency);
  if (periodMonths === null || periodMonths <= 0) {
    return 0;
  }
  return roundCurrency(
    (minimumBalance * annualInterestRate * periodMonths) / 1200,
  );
}

export function resolveEffectiveAnnualRate(
  interestModel: SavingsInterestModel,
  fixedRate: number | null,
  tiers: SavingsInterestTier[],
  currentBalance: number,
): { rate: number | null; belowMinimumTier: boolean } {
  if (interestModel === "fixed") {
    return {
      rate: fixedRate,
      belowMinimumTier: fixedRate === null || fixedRate <= 0,
    };
  }

  const tier = findTierForBalance(currentBalance, tiers);
  if (!tier) {
    return { rate: null, belowMinimumTier: true };
  }
  return { rate: tier.annualInterestRate, belowMinimumTier: false };
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
