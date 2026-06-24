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
import { PULL_TO_REFRESH_MAX_VISUAL_OFFSET_PX } from "@/lib/layout/pull-to-refresh";
import { SCREEN_HEADER_ZONE_TOP } from "@/lib/layout/screen-spacing";
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
 * Fixed card-colored bridge below the header — fills the PTR gap without
 * changing refresh mechanics. Hidden when the title has collapsed.
 */
function AccountDetailsHeaderPullBridge() {
  const collapsed = useScreenTitleCollapse()?.titleCollapsed ?? false;

  if (collapsed) return null;

  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none fixed inset-x-0 z-[35] mx-auto max-w-lg",
        CARD_SURFACE_BG_CLASS,
      )}
      style={{
        top: SCREEN_HEADER_ZONE_TOP,
        height: PULL_TO_REFRESH_MAX_VISUAL_OFFSET_PX,
      }}
    />
  );
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
    <>
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
      <AccountDetailsHeaderPullBridge />
    </>
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
