"use client";

import {
  AccountDetailsSummary,
  type AccountDetailsSummaryProps,
} from "@/components/accounts/account-details-summary";
import { AccountTypeIcon } from "@/components/ui/account-type-icon";
import { MetadataChip } from "@/components/accounts/metadata-chip";
import { getAccountTypeLabelKey } from "@/lib/finance/account-labels";
import {
  getAccountHeaderStatusLabelKey,
  getAccountHeaderStatusTone,
  type AccountDetailHeaderStatus,
} from "@/lib/finance/account-header-status";
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

/** @deprecated Use {@link AccountDetailsSummary} from account-details-chrome. */
export type AccountHeaderMetadataProps = AccountDetailsSummaryProps & {
  institutionSubtitle?: string | null;
};

/** @deprecated Use {@link AccountDetailsSummary}. */
export function AccountHeaderMetadata({
  institutionSubtitle: _institutionSubtitle,
  ...props
}: AccountHeaderMetadataProps) {
  return <AccountDetailsSummary {...props} />;
}
