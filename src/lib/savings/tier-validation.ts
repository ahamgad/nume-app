import type { SavingsInterestTier } from "@/lib/savings/types";
import type { TranslationKey } from "@/lib/i18n";

export interface TierFormRow {
  minBalance: string;
  maxBalance: string;
  annualInterestRate: string;
}

export interface ParsedTierRow {
  minBalance: number;
  maxBalance: number | null;
  annualInterestRate: number;
}

function parseTierAmount(value: string): number | null {
  const trimmed = value.trim().replace(/,/g, "");
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

export function parseTierRows(rows: TierFormRow[]): ParsedTierRow[] | null {
  const parsed: ParsedTierRow[] = [];
  for (const row of rows) {
    const minBalance = parseTierAmount(row.minBalance);
    const annualInterestRate = parseTierAmount(row.annualInterestRate);
    const maxRaw = row.maxBalance.trim();
    const maxBalance =
      maxRaw.length === 0 ? null : parseTierAmount(row.maxBalance);

    if (
      minBalance === null ||
      annualInterestRate === null ||
      minBalance < 0 ||
      annualInterestRate < 0 ||
      (maxBalance !== null && (maxBalance < minBalance || maxBalance < 0))
    ) {
      return null;
    }

    parsed.push({ minBalance, maxBalance, annualInterestRate });
  }
  return parsed;
}

export function validateTierStructure(
  tiers: ParsedTierRow[],
  t: (key: TranslationKey) => string,
): Record<string, string> {
  const errors: Record<string, string> = {};

  if (tiers.length === 0) {
    errors.tiers = t("savings.validation.tiersRequired");
    return errors;
  }

  const sorted = [...tiers].sort((a, b) => a.minBalance - b.minBalance);

  if (sorted[0].minBalance !== 0) {
    errors.tiers = t("savings.validation.tiersMustStartAtZero");
    return errors;
  }

  for (let index = 0; index < sorted.length; index += 1) {
    const tier = sorted[index];
    const isLast = index === sorted.length - 1;

    if (!isLast && tier.maxBalance === null) {
      errors.tiers = t("savings.validation.tiersOpenEndedOnlyLast");
      return errors;
    }

    if (tier.maxBalance !== null && tier.maxBalance < tier.minBalance) {
      errors.tiers = t("savings.validation.tiersInvalidRange");
      return errors;
    }

    if (!isLast) {
      const next = sorted[index + 1];
      if (tier.maxBalance === null) {
        errors.tiers = t("savings.validation.tiersOpenEndedOnlyLast");
        return errors;
      }
      if (next.minBalance !== tier.maxBalance + 1) {
        errors.tiers = t("savings.validation.tiersGap");
        return errors;
      }
    }
  }

  return errors;
}

export function findTierForBalance(
  balance: number,
  tiers: Pick<SavingsInterestTier, "minBalance" | "maxBalance" | "annualInterestRate">[],
): Pick<SavingsInterestTier, "minBalance" | "maxBalance" | "annualInterestRate"> | null {
  const sorted = [...tiers].sort((a, b) => a.minBalance - b.minBalance);
  for (const tier of sorted) {
    const withinMin = balance >= tier.minBalance;
    const withinMax =
      tier.maxBalance === null || balance <= tier.maxBalance;
    if (withinMin && withinMax) return tier;
  }
  return null;
}
