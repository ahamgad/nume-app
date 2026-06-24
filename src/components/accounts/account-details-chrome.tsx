"use client";

/**
 * Account details header building blocks (frozen).
 * All account detail screens must use these exports.
 * @see docs/FOUNDATION.md § 9
 */

import type { ReactNode } from "react";

import {
  AccountDetailsSummary,
  type AccountDetailsSummaryProps,
} from "@/components/accounts/account-details-summary";
import { StackPageHeader } from "@/components/layout/stack-page-chrome";
import { useScreenTitleCollapse } from "@/components/layout/screen-title-collapse";
import { accountDetailsHeaderRegionClassName } from "@/lib/layout/account-details-chrome";
import { CARD_SURFACE_BG_CLASS } from "@/lib/layout/card-surface";
import { cn } from "@/lib/utils";

export {
  ACCOUNT_DETAILS_SUMMARY_LOGO_SIZE_PX,
  AccountDetailsSummary,
  type AccountDetailsSummaryProps,
} from "@/components/accounts/account-details-summary";

export {
  AccountDetailsDetailRow,
  AccountDetailsSection,
} from "@/components/accounts/account-details-section";

export { AccountDetailsToggleSettingRow } from "@/components/accounts/account-details-toggle-setting-row";

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
  const collapsed = useScreenTitleCollapse()?.titleCollapsed ?? false;

  return (
    <StackPageHeader
      title={accountName}
      onBack={onBack}
      rightAction={rightAction}
      surfaceState={collapsed ? "canvas" : "card"}
      className={cn(
        "transition-colors duration-200",
        collapsed ? "bg-background" : CARD_SURFACE_BG_CLASS,
      )}
    />
  );
}

/** Shared account details content header — logo block for all account detail screens. */
export function AccountDetailsContentHeader(
  props: AccountDetailsSummaryProps,
) {
  return <AccountDetailsSummary {...props} />;
}

/** Card-surface hero for account title + first balance section; collapses on scroll. */
export function AccountDetailsHeaderRegion({
  children,
}: {
  children: ReactNode;
}) {
  const collapsed = useScreenTitleCollapse()?.titleCollapsed ?? false;

  return (
    <div className={accountDetailsHeaderRegionClassName(collapsed)}>
      {children}
    </div>
  );
}
