"use client";

import type { ReactNode } from "react";

import { StackPageHeader, StackPageTitle } from "@/components/layout/stack-page-chrome";

export {
  ACCOUNT_DETAILS_SUMMARY_LOGO_SIZE_PX,
  AccountDetailsSummary,
  type AccountDetailsSummaryProps,
} from "@/components/accounts/account-details-summary";

interface AccountDetailsStackHeaderProps {
  accountName: string;
  onBack?: () => void;
  rightAction?: ReactNode;
}

/** Collapsing navigation header — title is the account name. */
export function AccountDetailsStackHeader({
  accountName,
  onBack,
  rightAction,
}: AccountDetailsStackHeaderProps) {
  return (
    <StackPageHeader
      title={accountName}
      onBack={onBack}
      rightAction={rightAction}
    />
  );
}

/** Large in-content title — account name; pairs with collapse foundation. */
export function AccountDetailsLargeTitle({
  accountName,
}: {
  accountName: string;
}) {
  return <StackPageTitle>{accountName}</StackPageTitle>;
}
