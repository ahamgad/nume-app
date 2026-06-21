"use client";

import {
  InstitutionBrandAsset,
  INSTITUTION_BRAND_ASSET_ACCOUNT_SIZE,
} from "@/components/institutions/institution-brand-asset";
import {
  formatInstitutionEntityLabel,
  resolveInstitutionBrandAssetProps,
} from "@/lib/institutions/catalog";
import type { Account } from "@/lib/finance/types";
import type { TranslationKey } from "@/lib/i18n";
import { cn } from "@/lib/utils";

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
      fallbackLabel={account.name}
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
        "flex min-h-16 w-full items-center gap-3 rounded-md px-3 py-2 text-start transition-colors",
        selected ? "bg-muted font-medium" : "hover:bg-muted/60",
      )}
    >
      <div className="shrink-0 self-center">{leading}</div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[0.9375rem] font-medium">{account.name}</p>
        {institutionLabel ? (
          <p className="truncate text-sm text-muted-foreground">
            {institutionLabel}
          </p>
        ) : null}
      </div>
    </button>
  );
}
