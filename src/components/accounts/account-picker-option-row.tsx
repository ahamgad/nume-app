"use client";

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
import { useFormatLocale } from "@/providers/i18n-provider";

interface AccountPickerOptionRowProps {
  account: Account;
  selected?: boolean;
  t: (key: TranslationKey) => string;
  onClick: () => void;
}

export function AccountPickerOptionRow({
  account,
  selected = false,
  t,
  onClick,
}: AccountPickerOptionRowProps) {
  const formatLocale = useFormatLocale();
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
    <button
      type="button"
      role="option"
      aria-selected={selected}
      onClick={onClick}
      className={cn(
        "flex min-h-16 w-full items-center gap-3 px-3 py-3 text-start transition-colors",
        selected ? "bg-muted font-medium" : "hover:bg-muted/60 active:bg-muted",
      )}
    >
      <div className="shrink-0 self-center">{leading}</div>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex min-w-0 items-center gap-3">
          <p className="min-w-0 flex-1 truncate text-[0.9375rem] font-medium">
            {account.name}
          </p>
          <ResponsiveCurrencyAmount
            amount={displayBalance}
            locale={formatLocale}
            variant="row"
            className={cn("w-auto shrink-0", balanceToneClassName)}
          />
        </div>
        <p className="truncate text-[0.8125rem] text-muted-foreground">
          {typeLabel}
        </p>
        {institutionLabel ? (
          <p className="truncate text-[0.8125rem] text-muted-foreground">
            {institutionLabel}
          </p>
        ) : null}
      </div>
    </button>
  );
}
