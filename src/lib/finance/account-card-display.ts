import { getAccountTypeCardLabelKey } from "@/lib/finance/account-labels";
import type { Account } from "@/lib/finance/types";
import type { TranslationKey } from "@/lib/i18n";

const ACCOUNT_CARD_METADATA_SEPARATOR = " · ";

/** Top metadata row on account cards — localized account type · last-4 when available. */
export function formatAccountCardInstituteRow(
  account: Pick<Account, "type">,
  identifierLast4: string | null | undefined,
  t: (key: TranslationKey) => string,
): string {
  const typeLabel = t(getAccountTypeCardLabelKey(account.type));
  const identifier = identifierLast4?.trim() || null;

  if (identifier) {
    return `${typeLabel}${ACCOUNT_CARD_METADATA_SEPARATOR}${identifier}`;
  }
  return typeLabel;
}
