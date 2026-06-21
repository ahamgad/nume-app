"use client";

import type { ReactNode } from "react";

import {
  InstitutionBrandAsset,
  INSTITUTION_BRAND_ASSET_ACCOUNT_SIZE,
} from "@/components/institutions/institution-brand-asset";
import { ResponsiveCurrencyAmount } from "@/components/ui/responsive-currency-amount";
import { getAccountTypeCardLabelKey } from "@/lib/finance/account-labels";
import {
  getAccountDisplayBalance,
  getBalanceToneClassName,
} from "@/lib/finance/balance-display";
import type { Account } from "@/lib/finance/types";
import {
  formatInstitutionEntityLabel,
  resolveInstitutionBrandAssetProps,
} from "@/lib/institutions/catalog";
import type { TranslationKey } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface AccountRowContentProps {
  account: Account;
  formatLocale: string;
  t: (key: TranslationKey) => string;
  trailing?: ReactNode;
  /** Show institution name as a subtitle (pickers). */
  showInstitutionName?: boolean;
}

export function AccountRowContent({
  account,
  formatLocale,
  t,
  trailing,
  showInstitutionName = false,
}: AccountRowContentProps) {
  const displayBalance = getAccountDisplayBalance(account);
  const typeLabel = t(getAccountTypeCardLabelKey(account.type));
  const balanceToneClassName = getBalanceToneClassName(account);
  const brandAsset = resolveInstitutionBrandAssetProps(account.institution, t);
  const institutionLabel = account.institution?.trim()
    ? formatInstitutionEntityLabel(account.institution, t)
    : null;

  const leading = brandAsset ? (
    <InstitutionBrandAsset
      institutionId={brandAsset.institutionId}
      fallbackLabel={brandAsset.fallbackLabel}
      size={INSTITUTION_BRAND_ASSET_ACCOUNT_SIZE}
    />
  ) : (
    <InstitutionBrandAsset
      institutionId={account.type}
      fallbackLabel={typeLabel}
      size={INSTITUTION_BRAND_ASSET_ACCOUNT_SIZE}
    />
  );

  return (
    <>
      <div className="shrink-0 self-center">{leading}</div>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex min-w-0 items-center gap-3">
          <p className="min-w-0 flex-1 truncate text-[0.8125rem] text-muted-foreground">
            {typeLabel}
          </p>
          <div className="flex shrink-0 items-center gap-2">
            <ResponsiveCurrencyAmount
              amount={displayBalance}
              locale={formatLocale}
              variant="row"
              className={cn("w-auto shrink-0", balanceToneClassName)}
            />
            {trailing}
          </div>
        </div>
        <p className="min-w-0 truncate text-[0.9375rem] font-medium">
          {account.name}
        </p>
        {showInstitutionName && institutionLabel ? (
          <p className="min-w-0 truncate text-[0.8125rem] text-muted-foreground">
            {institutionLabel}
          </p>
        ) : null}
      </div>
    </>
  );
}
