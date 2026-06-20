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
      <div className="flex shrink-0 self-center">{leading}</div>
      <div className="grid min-w-0 flex-1 grid-cols-1 grid-rows-2 gap-0.5">
        <p className="truncate text-[0.8125rem] leading-snug text-muted-foreground">
          {typeLabel}
        </p>
        <p className="truncate text-[0.9375rem] font-semibold leading-snug">
          {account.name}
        </p>
      </div>
      <div className="flex shrink-0 items-start gap-2">
        <div className="min-w-0 max-w-[50%] pt-px text-end leading-snug">
          <ResponsiveCurrencyAmount
            amount={account.currentBalance}
            locale={formatLocale}
            variant="row"
          />
        </div>
        <ChevronRight className="mt-0.5 size-5 shrink-0 text-muted-foreground rtl:rotate-180" />
      </div>
    </button>
  );
}
