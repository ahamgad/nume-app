"use client";

import type { ReactNode } from "react";

import {
  AccountDetailsSummary,
  type AccountDetailsSummaryProps,
} from "@/components/accounts/account-details-summary";
import { StackPageHeader } from "@/components/layout/stack-page-chrome";

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

/**
 * Account details navigation header — empty until the in-content account name
 * scrolls under, then the account name fades into the header (truncated).
 */
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

/** Shared account details content header — logo block for all account detail screens. */
export function AccountDetailsContentHeader(
  props: AccountDetailsSummaryProps,
) {
  return <AccountDetailsSummary {...props} />;
}
