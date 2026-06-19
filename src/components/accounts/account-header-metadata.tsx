"use client";

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

export interface AccountHeaderMetadataProps {
  institutionSubtitle?: string | null;
  accountType: AccountType;
  status?: AccountDetailHeaderStatus | null;
  supplementaryChips?: TranslationKey[];
  className?: string;
}

/** Unified institution subtitle + metadata chips row for account details headers. */
export function AccountHeaderMetadata({
  institutionSubtitle,
  accountType,
  status,
  supplementaryChips = [],
  className,
}: AccountHeaderMetadataProps) {
  return (
    <div className={cn("space-y-1", className)}>
      {institutionSubtitle ? (
        <p className="text-[0.8125rem] text-muted-foreground tabular-nums">
          {institutionSubtitle}
        </p>
      ) : null}
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
