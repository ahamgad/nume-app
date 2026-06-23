"use client";

import { AccountCard } from "@/components/accounts/account-card";
import { resolveAccountNumberLast4 } from "@/lib/finance/account-identity-validation";
import type { Certificate } from "@/lib/certificates/types";
import type { CreditCard } from "@/lib/credit-cards/types";
import type { Loan } from "@/lib/lending/types";
import type { Account } from "@/lib/finance/types";
import type { TranslationKey } from "@/lib/i18n";
import {
  ACCOUNT_CARD_CATEGORY_LABEL_CLASS,
  ACCOUNT_CARD_CATEGORY_TO_FIRST_GAP_PX,
  ACCOUNT_CARD_GAP_PX,
} from "@/lib/layout/account-card-chrome";

interface AccountCardsSectionProps {
  title: string;
  accounts: Account[];
  formatLocale: string;
  certificates: Certificate[];
  creditCards: CreditCard[];
  loans: Loan[];
  onSelect: (accountId: string) => void;
  t: (key: TranslationKey) => string;
}

/**
 * Category group for the Accounts tab — label + stacked account cards.
 *
 * @see docs/FOUNDATION.md — Account cards foundation
 */
export function AccountCardsSection({
  title,
  accounts,
  formatLocale,
  certificates,
  creditCards,
  loans,
  onSelect,
  t,
}: AccountCardsSectionProps) {
  if (accounts.length === 0) return null;

  const identityContext = { certificates, creditCards, loans };

  return (
    <section>
      <p
        className={ACCOUNT_CARD_CATEGORY_LABEL_CLASS}
        style={{ marginBottom: ACCOUNT_CARD_CATEGORY_TO_FIRST_GAP_PX }}
      >
        {title}
      </p>
      <div
        className="flex flex-col"
        style={{ gap: ACCOUNT_CARD_GAP_PX }}
      >
        {accounts.map((account) => (
          <AccountCard
            key={account.id}
            account={account}
            formatLocale={formatLocale}
            identifierLast4={resolveAccountNumberLast4(account, identityContext)}
            t={t}
            onClick={() => onSelect(account.id)}
          />
        ))}
      </div>
    </section>
  );
}
