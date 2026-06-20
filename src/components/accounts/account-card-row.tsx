"use client";

import { ChevronRight } from "lucide-react";

import {
  InstitutionBrandAsset,
  INSTITUTION_BRAND_ASSET_ACCOUNT_SIZE,
} from "@/components/institutions/institution-brand-asset";
import { ResponsiveCurrencyAmount } from "@/components/ui/responsive-currency-amount";
import { getAccountTypeCardLabelKey } from "@/lib/finance/account-labels";
import type { Account } from "@/lib/finance/types";
import { resolveInstitutionBrandAssetProps } from "@/lib/institutions/catalog";
import type { TranslationKey } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface AccountCardRowProps {
  account: Account;
  formatLocale: string;
  onClick: () => void;
  t: (key: TranslationKey) => string;
}

export function AccountCardRow({
  account,
  formatLocale,
  onClick,
  t,
}: AccountCardRowProps) {
  const typeLabel = t(getAccountTypeCardLabelKey(account.type));
  const brandAsset = resolveInstitutionBrandAssetProps(account.institution, t);

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
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "grid w-full min-h-16 grid-cols-[auto_minmax(0,1fr)_auto] grid-rows-[auto_auto] items-center gap-x-3 gap-y-0.5 px-4 py-3 text-start transition-colors active:bg-muted",
      )}
    >
      <div className="col-start-1 row-span-2 self-center">{leading}</div>

      <p className="col-start-2 row-start-1 min-w-0 truncate text-[0.8125rem] text-muted-foreground">
        {typeLabel}
      </p>

      <div className="col-start-3 row-start-1 flex shrink-0 items-center gap-2">
        <ResponsiveCurrencyAmount
          amount={account.currentBalance}
          locale={formatLocale}
          variant="row"
          className="w-auto shrink-0"
        />
        <ChevronRight className="size-5 shrink-0 text-muted-foreground rtl:rotate-180" />
      </div>

      <p className="col-start-2 row-start-2 min-w-0 truncate text-[0.9375rem] font-medium">
        {account.name}
      </p>
    </button>
  );
};
