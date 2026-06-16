import type { Account } from "@/lib/finance/types";
import { filterTransferAccounts } from "@/lib/finance/account-capabilities";
import {
  matchInstitutionEntryGlobal,
  type InstitutionCategory,
} from "@/lib/institutions/catalog";
import type { TranslationKey } from "@/lib/i18n";

type InstitutionTranslator = (key: TranslationKey) => string;

const INTEREST_DESTINATION_INSTITUTION_CATEGORIES = new Set<InstitutionCategory>([
  "bank",
  "financial_service",
]);

export function isInterestDestinationInstitution(
  institution: string | null,
  t: InstitutionTranslator,
): boolean {
  if (!institution?.trim()) return false;
  const match = matchInstitutionEntryGlobal(institution.trim(), t);
  if (!match) return false;
  return INTEREST_DESTINATION_INSTITUTION_CATEGORIES.has(match.category);
}

/** Transfer-capable accounts at banks or financial-service institutions. */
export function filterInterestDestinationAccounts(
  accounts: Account[],
  t: InstitutionTranslator,
  options?: { excludeAccountIds?: string[] },
): Account[] {
  return filterTransferAccounts(accounts, options).filter((account) =>
    isInterestDestinationInstitution(account.institution, t),
  );
}
