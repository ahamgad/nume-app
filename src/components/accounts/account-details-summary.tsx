"use client";

import {
  AccountStatusMetadataChip,
  AccountTypeMetadataChip,
  SupplementaryMetadataChip,
} from "@/components/accounts/account-header-metadata";
import { InstitutionBrandAsset } from "@/components/institutions/institution-brand-asset";
import { AccountTypeIcon } from "@/components/ui/account-type-icon";
import type { AccountDetailHeaderStatus } from "@/lib/finance/account-header-status";
import type { AccountType } from "@/lib/finance/types";
import type { TranslationKey } from "@/lib/i18n";
import { resolveInstitutionBrandAssetProps } from "@/lib/institutions/catalog";
import { useT } from "@/providers/i18n-provider";
import { cn } from "@/lib/utils";

/** Institution logo size in the account details summary block (px). */
export const ACCOUNT_DETAILS_SUMMARY_LOGO_SIZE_PX = 56;

export interface AccountDetailsSummaryProps {
  accountName: string;
  institution?: string | null;
  accountType: AccountType;
  status?: AccountDetailHeaderStatus | null;
  supplementaryChips?: TranslationKey[];
  className?: string;
}

/**
 * Account details summary — logo + type, status, and name rows.
 * Shared by all account detail screens.
 */
export function AccountDetailsSummary({
  accountName,
  institution,
  accountType,
  status,
  supplementaryChips = [],
  className,
}: AccountDetailsSummaryProps) {
  const t = useT();
  const brandAsset = resolveInstitutionBrandAssetProps(institution, t);

  return (
    <div className={cn("flex min-w-0 gap-4", className)}>
      {brandAsset ? (
        <InstitutionBrandAsset
          institutionId={brandAsset.institutionId}
          fallbackLabel={brandAsset.fallbackLabel}
          size={ACCOUNT_DETAILS_SUMMARY_LOGO_SIZE_PX}
          className="self-start"
        />
      ) : (
        <span
          className="inline-flex size-14 shrink-0 items-center justify-center self-start rounded-[8px] bg-muted"
          aria-hidden
        >
          <AccountTypeIcon type={accountType} className="size-6" />
        </span>
      )}
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex flex-wrap gap-2">
          <AccountTypeMetadataChip type={accountType} />
        </div>
        {status ? (
          <div className="flex flex-wrap gap-2">
            <AccountStatusMetadataChip status={status} />
          </div>
        ) : null}
        {supplementaryChips.map((labelKey) => (
          <div key={labelKey} className="flex flex-wrap gap-2">
            <SupplementaryMetadataChip labelKey={labelKey} />
          </div>
        ))}
        <p className="truncate text-[1.0625rem] font-semibold leading-snug">
          {accountName}
        </p>
      </div>
    </div>
  );
}
