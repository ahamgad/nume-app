"use client";

import { ChevronRight } from "lucide-react";

import {
  InstitutionBrandAsset,
} from "@/components/institutions/institution-brand-asset";
import { CurrencyAmount } from "@/components/ui/currency-amount";
import { formatAccountCardInstituteRow } from "@/lib/finance/account-card-display";
import { getAccountTypeCardLabelKey } from "@/lib/finance/account-labels";
import {
  getAccountDisplayBalance,
  isLiabilityAccountType,
} from "@/lib/finance/balance-display";
import type { Account } from "@/lib/finance/types";
import { resolveInstitutionBrandAssetProps } from "@/lib/institutions/catalog";
import type { TranslationKey } from "@/lib/i18n";
import {
  ACCOUNT_CARD_BALANCE_LABEL_CLASS,
  ACCOUNT_CARD_BALANCE_VALUE_CLASS,
  ACCOUNT_CARD_CONTAINER_CLASS,
  ACCOUNT_CARD_INSTITUTE_ROW_CLASS,
  ACCOUNT_CARD_LOGO_SIZE_PX,
  ACCOUNT_CARD_LOGO_TEXT_GAP_PX,
  ACCOUNT_CARD_NAME_CLASS,
  ACCOUNT_CARD_PADDING_CLASS,
  ACCOUNT_CARD_SECTION_DIVIDER_GAP_PX,
} from "@/lib/layout/account-card-chrome";
import { cn } from "@/lib/utils";

export interface AccountCardProps {
  account: Account;
  formatLocale: string;
  identifierLast4?: string | null;
  onClick: () => void;
  t: (key: TranslationKey) => string;
}

/**
 * Frozen account card for the Accounts tab list.
 *
 * @see docs/FOUNDATION.md — Account cards foundation
 */
export function AccountCard({
  account,
  formatLocale,
  identifierLast4,
  onClick,
  t,
}: AccountCardProps) {
  const displayBalance = getAccountDisplayBalance(account);
  const showSignedBalance = !isLiabilityAccountType(account.type);
  const typeLabel = t(getAccountTypeCardLabelKey(account.type));
  const brandAsset = resolveInstitutionBrandAssetProps(account.institution, t);
  const typeRow = formatAccountCardInstituteRow(
    account,
    identifierLast4,
    t,
  );

  const logo = brandAsset ? (
    <InstitutionBrandAsset
      institutionId={brandAsset.institutionId}
      fallbackLabel={brandAsset.fallbackLabel}
      size={ACCOUNT_CARD_LOGO_SIZE_PX}
      className="shrink-0 self-start"
    />
  ) : (
    <InstitutionBrandAsset
      institutionId={account.type}
      fallbackLabel={typeLabel}
      size={ACCOUNT_CARD_LOGO_SIZE_PX}
      className="shrink-0 self-start"
    />
  );

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(ACCOUNT_CARD_CONTAINER_CLASS, ACCOUNT_CARD_PADDING_CLASS)}
    >
      <div
        className="flex min-w-0"
        style={{ gap: ACCOUNT_CARD_LOGO_TEXT_GAP_PX }}
      >
        {logo}
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <div className="flex min-w-0 items-center gap-2">
            <p className={ACCOUNT_CARD_INSTITUTE_ROW_CLASS}>{typeRow}</p>
            <ChevronRight
              className="size-5 shrink-0 text-muted-foreground rtl:rotate-180"
              aria-hidden
            />
          </div>
          <p className={ACCOUNT_CARD_NAME_CLASS}>{account.name}</p>
        </div>
      </div>

      <div
        style={{
          marginTop: ACCOUNT_CARD_SECTION_DIVIDER_GAP_PX,
          marginBottom: ACCOUNT_CARD_SECTION_DIVIDER_GAP_PX,
        }}
      >
        <div className="border-t border-border" role="presentation" />
      </div>

      <div className="flex flex-col gap-0.5">
        <p className={ACCOUNT_CARD_BALANCE_LABEL_CLASS}>
          {t("accounts.sections.balance")}
        </p>
        <CurrencyAmount
          amount={displayBalance}
          locale={formatLocale}
          variant="inline"
          signMode={showSignedBalance ? "balance" : "unsigned"}
          className={ACCOUNT_CARD_BALANCE_VALUE_CLASS}
        />
      </div>
    </button>
  );
}
