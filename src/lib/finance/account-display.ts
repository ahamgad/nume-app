import { getAccountTypeLabelKey } from "@/lib/finance/account-labels";
import type { Account } from "@/lib/finance/types";
import {
  formatInstitutionEntityLabel,
  institutionMatchesSearch,
} from "@/lib/institutions/catalog";
import type { TranslationKey } from "@/lib/i18n";

type AccountLabelTranslator = (key: TranslationKey, params?: Record<string, string>) => string;

/** Secondary line for accounts list rows (Active and Archived). */
export function formatAccountListSubtitle(
  account: Pick<Account, "type" | "institution">,
  t: AccountLabelTranslator,
): string {
  const typeLabel = t(getAccountTypeLabelKey(account.type));
  if (account.institution?.trim()) {
    return t("accounts.list.meta", {
      institution: formatInstitutionEntityLabel(account.institution, t),
      type: typeLabel,
    });
  }
  return typeLabel;
}

/** Secondary line for destination picker rows. */
export function formatAccountDestinationSubtitle(
  account: Account,
  t: AccountLabelTranslator,
): string {
  const typeLabel = t(getAccountTypeLabelKey(account.type));
  if (account.institution) {
    return `${formatInstitutionEntityLabel(account.institution, t)} · ${typeLabel}`;
  }
  return typeLabel;
}

/** Primary display for destination picker trigger and certificate details. */
export function formatAccountDestinationDisplay(
  account: Account,
  t: AccountLabelTranslator,
): string {
  if (account.name.trim()) return account.name.trim();
  return formatAccountDestinationSubtitle(account, t);
}

export function filterAccountsForDestinationSearch(
  accounts: Account[],
  query: string,
  t: AccountLabelTranslator,
): Account[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return accounts;

  return accounts.filter((account) => {
    if (account.name.toLowerCase().includes(normalized)) return true;
    if (account.institution?.toLowerCase().includes(normalized)) return true;
    if (
      institutionMatchesSearch(account.institution ?? "", normalized, t)
    ) {
      return true;
    }
    if (
      t(getAccountTypeLabelKey(account.type))
        .toLowerCase()
        .includes(normalized)
    ) {
      return true;
    }
    return false;
  });
}
