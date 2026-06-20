"use client";

import {
  InstitutionBrandAsset,
  INSTITUTION_BRAND_ASSET_DETAILS_HEADER_SIZE,
} from "@/components/institutions/institution-brand-asset";
import { AccountTypeIcon } from "@/components/ui/account-type-icon";
import { MetadataChip } from "@/components/accounts/metadata-chip";
import { getAccountTypeLabelKey } from "@/lib/finance/account-labels";
import {
  getAccountHeaderStatusLabelKey,
  getAccountHeaderStatusTone,
  type AccountDetailHeaderStatus,
} from "@/lib/finance/account-header-status";
import { resolveInstitutionBrandAssetProps } from "@/lib/institutions/catalog";
import type { AccountType } from "@/lib/finance/types";
import type { TranslationKey } from "@/lib/i18n";
import { useT } from "@/providers/i18n-provider";
import { cn } from "@/lib/utils";

interface AccountTypeMetadataChipProps {
  type: AccountType;
  className?: string;
}

export function AccountTypeMetadataChip({
  type,
  className,
}: AccountTypeMetadataChipProps) {
  const t = useT();
  return (
    <MetadataChip tone="neutral" className={className}>
      <AccountTypeIcon type={type} className="size-3" />
      {t(getAccountTypeLabelKey(type))}
    </MetadataChip>
  );
}

interface AccountStatusMetadataChipProps {
  status: AccountDetailHeaderStatus;
  className?: string;
}

export function AccountStatusMetadataChip({
  status,
  className,
}: AccountStatusMetadataChipProps) {
  const t = useT();
  return (
    <MetadataChip
      tone={getAccountHeaderStatusTone(status)}
      className={className}
    >
      {t(getAccountHeaderStatusLabelKey(status))}
    </MetadataChip>
  );
}

interface SupplementaryMetadataChipProps {
  labelKey: TranslationKey;
  className?: string;
}

export function SupplementaryMetadataChip({
  labelKey,
  className,
}: SupplementaryMetadataChipProps) {
  const t = useT();
  return (
    <MetadataChip tone="neutral" className={className}>
      {t(labelKey)}
    </MetadataChip>
  );
}

export interface AccountHeaderMetadataProps {
  /** Account display name — primary line in the header content block. */
  accountName: string;
  /** Stored institution value — used for brand asset lookup. */
  institution?: string | null;
  institutionSubtitle?: string | null;
  accountType: AccountType;
  status?: AccountDetailHeaderStatus | null;
  supplementaryChips?: TranslationKey[];
  className?: string;
}

/** Institution + account name block and metadata chips for account details headers. */
export function AccountHeaderMetadata({
  accountName,
  institution,
  institutionSubtitle,
  accountType,
  status,
  supplementaryChips = [],
  className,
}: AccountHeaderMetadataProps) {
  const t = useT();
  const brandAsset = resolveInstitutionBrandAssetProps(institution, t);
  const showInstitutionRow = Boolean(institutionSubtitle?.trim() && brandAsset);

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex min-w-0 gap-3">
        {showInstitutionRow && brandAsset ? (
          <InstitutionBrandAsset
            institutionId={brandAsset.institutionId}
            fallbackLabel={brandAsset.fallbackLabel}
            size={INSTITUTION_BRAND_ASSET_DETAILS_HEADER_SIZE}
            className="self-center"
          />
        ) : null}
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5">
          {showInstitutionRow ? (
            <p className="truncate text-[0.8125rem] leading-snug text-muted-foreground tabular-nums">
              {institutionSubtitle}
            </p>
          ) : null}
          <p className="truncate text-[1.0625rem] font-semibold leading-snug">
            {accountName}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <AccountTypeMetadataChip type={accountType} />
        {status ? <AccountStatusMetadataChip status={status} /> : null}
        {supplementaryChips.map((labelKey) => (
          <SupplementaryMetadataChip key={labelKey} labelKey={labelKey} />
        ))}
      </div>
    </div>
  );
}
