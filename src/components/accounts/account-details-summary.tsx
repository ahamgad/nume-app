"use client";

import { InstitutionBrandAsset } from "@/components/institutions/institution-brand-asset";
import { StackPageTitle } from "@/components/layout/stack-page-chrome";
import { ACCOUNT_DETAILS_TITLE_CLASS } from "@/lib/layout/account-details-chrome";
import { getAccountTypeInitial } from "@/lib/finance/account-labels";
import type { AccountType } from "@/lib/finance/types";
import { resolveInstitutionBrandAssetProps } from "@/lib/institutions/catalog";
import { useT } from "@/providers/i18n-provider";
import { cn } from "@/lib/utils";

/** Institution logo size in the account details summary block (px). */
export const ACCOUNT_DETAILS_SUMMARY_LOGO_SIZE_PX = 48;

export interface AccountDetailsSummaryProps {
  accountName: string;
  institution?: string | null;
  institutionSubtitle?: string | null;
  accountType: AccountType;
  className?: string;
}

/**
 * Logo + institution subtitle + account name — account details content header.
 * Account name uses the large-title collapse foundation.
 */
export function AccountDetailsSummary({
  accountName,
  institution,
  institutionSubtitle,
  accountType,
  className,
}: AccountDetailsSummaryProps) {
  const t = useT();
  const brandAsset = resolveInstitutionBrandAssetProps(institution, t);
  const showMetadataRow = Boolean(institutionSubtitle?.trim());

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
          className="inline-flex size-12 shrink-0 items-center justify-center self-start rounded-[8px] bg-muted text-base font-semibold text-muted-foreground"
          aria-hidden
        >
          {getAccountTypeInitial(accountType, t)}
        </span>
      )}
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5">
        {showMetadataRow ? (
          <p className="truncate text-[0.8125rem] leading-snug text-muted-foreground tabular-nums">
            {institutionSubtitle}
          </p>
        ) : null}
        <StackPageTitle className={cn("mb-0 truncate", ACCOUNT_DETAILS_TITLE_CLASS)}>
          {accountName}
        </StackPageTitle>
      </div>
    </div>
  );
}
