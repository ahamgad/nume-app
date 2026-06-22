"use client";

import {
  AccountStatusMetadataChip,
  AccountTypeMetadataChip,
  SupplementaryMetadataChip,
} from "@/components/accounts/account-header-metadata";
import { InstitutionBrandAsset } from "@/components/institutions/institution-brand-asset";
import { StackPageTitle } from "@/components/layout/stack-page-chrome";
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
  institutionSubtitle?: string | null;
  accountType: AccountType;
  status?: AccountDetailHeaderStatus | null;
  supplementaryChips?: TranslationKey[];
  className?: string;
}

/** Type and status chips — row A in the account details content header. */
export function AccountDetailsMetadataRow({
  accountType,
  status,
  supplementaryChips = [],
  className,
}: Pick<
  AccountDetailsSummaryProps,
  "accountType" | "status" | "supplementaryChips" | "className"
>) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <AccountTypeMetadataChip type={accountType} />
      {status ? <AccountStatusMetadataChip status={status} /> : null}
      {supplementaryChips.map((labelKey) => (
        <SupplementaryMetadataChip key={labelKey} labelKey={labelKey} />
      ))}
    </div>
  );
}

/**
 * Logo + institution subtitle + account name — row B in the account details content header.
 * Account name uses the large-title collapse foundation.
 */
export function AccountDetailsSummary({
  accountName,
  institution,
  institutionSubtitle,
  accountType,
  className,
}: Pick<
  AccountDetailsSummaryProps,
  "accountName" | "institution" | "institutionSubtitle" | "accountType" | "className"
>) {
  const t = useT();
  const brandAsset = resolveInstitutionBrandAssetProps(institution, t);
  const showInstitutionRow = Boolean(institutionSubtitle?.trim() && brandAsset);

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
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5">
        {showInstitutionRow ? (
          <p className="truncate text-[0.8125rem] leading-snug text-muted-foreground tabular-nums">
            {institutionSubtitle}
          </p>
        ) : null}
        <StackPageTitle className="pb-0">{accountName}</StackPageTitle>
      </div>
    </div>
  );
}
