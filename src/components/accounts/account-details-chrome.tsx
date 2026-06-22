"use client";

import type { ReactNode } from "react";

import {
  AccountDetailsMetadataRow,
  AccountDetailsSummary,
  type AccountDetailsSummaryProps,
} from "@/components/accounts/account-details-summary";
import { StackPageHeader } from "@/components/layout/stack-page-chrome";
import { cn } from "@/lib/utils";

export {
  ACCOUNT_DETAILS_SUMMARY_LOGO_SIZE_PX,
  AccountDetailsMetadataRow,
  AccountDetailsSummary,
  type AccountDetailsSummaryProps,
} from "@/components/accounts/account-details-summary";

interface AccountDetailsStackHeaderProps {
  pageTitle: string;
  accountName: string;
  onBack?: () => void;
  rightAction?: ReactNode;
}

/**
 * Account details navigation header — "Account Details" until the in-content
 * account name scrolls under, then swaps to the account name (truncated).
 */
export function AccountDetailsStackHeader({
  pageTitle,
  accountName,
  onBack,
  rightAction,
}: AccountDetailsStackHeaderProps) {
  return (
    <StackPageHeader
      title={pageTitle}
      collapsedTitle={accountName}
      onBack={onBack}
      rightAction={rightAction}
    />
  );
}

/**
 * Shared account details content header — type/status row, then logo block.
 * Used by all account detail screens.
 */
export function AccountDetailsContentHeader({
  className,
  ...props
}: AccountDetailsSummaryProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <AccountDetailsMetadataRow
        accountType={props.accountType}
        status={props.status}
        supplementaryChips={props.supplementaryChips}
      />
      <AccountDetailsSummary {...props} />
    </div>
  );
}
