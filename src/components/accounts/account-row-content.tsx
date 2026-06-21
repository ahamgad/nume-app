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
}

export function AccountRowContent({
  account,
  formatLocale,
  t,
  trailing,
}: AccountRowContentProps) {
  const displayBalance = getAccountDisplayBalance(account);
  const typeLabel = t(getAccountTypeCardLabelKey(account.type));
  const balanceToneClassName = getBalanceToneClassName(account);
  const brandAsset = resolveInstitutionBrandAssetProps(account.institution, t);
  const institutionLabel = account.institution?.trim()
    ? formatInstitutionEntityLabel(account.institution, t)
    : null;
  const metaLabel = institutionLabel
    ? `${institutionLabel} · ${typeLabel}`
    : typeLabel;

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
            {metaLabel}
          </p>
          <div className={cn("flex w-auto shrink-0 items-center gap-2", balanceToneClassName)}>
            <ResponsiveCurrencyAmount
              amount={displayBalance}
              locale={formatLocale}
              variant="row"
            />
            {trailing}
          </div>
        </div>
        <p className="min-w-0 truncate text-[0.9375rem] font-medium">
          {account.name}
        </p>
      </div>
    </>
  );
}
