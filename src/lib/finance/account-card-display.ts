import { formatAccountInstitutionSubtitle } from "@/lib/finance/account-display";
import { getAccountTypeCardLabelKey } from "@/lib/finance/account-labels";
import type { Account } from "@/lib/finance/types";
import type { TranslationKey } from "@/lib/i18n";

/** Institute row on account cards — institution · last-4 when available. */
export function formatAccountCardInstituteRow(
  account: Pick<Account, "type" | "institution">,
  identifierLast4: string | null | undefined,
  t: (key: TranslationKey) => string,
): string {
  const instituteRow = formatAccountInstitutionSubtitle(
    account.institution,
    identifierLast4,
    t,
  );
  if (instituteRow) return instituteRow;
  return t(getAccountTypeCardLabelKey(account.type));
}
