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
        "flex min-h-16 w-full gap-3 px-4 py-3 text-start transition-colors active:bg-muted",
      )}
    >
      <div className="shrink-0 self-center">{leading}</div>

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex min-w-0 items-center gap-3">
          <p className="min-w-0 flex-1 truncate text-[0.8125rem] text-muted-foreground">
            {typeLabel}
          </p>
          <div className="flex shrink-0 items-center gap-2">
            <ResponsiveCurrencyAmount
              amount={account.currentBalance}
              locale={formatLocale}
              variant="row"
              className="w-auto shrink-0"
            />
            <ChevronRight className="size-5 shrink-0 text-muted-foreground rtl:rotate-180" />
          </div>
        </div>
        <p className="min-w-0 truncate text-[0.9375rem] font-medium">
          {account.name}
        </p>
      </div>
    </button>
  );
};
