"use client";

import type { ReactNode } from "react";

import { MetricHero, WidgetCard } from "@/components/patterns";
import { getAccountDetailsBalanceDisplayProps } from "@/lib/finance/balance-display";
import {
  accountDetailsBalanceMetaClassName,
  ACCOUNT_DETAILS_SECTION_PADDING_CLASS,
} from "@/lib/layout/account-details-chrome";

interface AccountDetailsBalanceCardProps {
  label: string;
  amount: number;
  locale: string;
  meta?: string;
  amountAction?: ReactNode;
  footer?: ReactNode;
}

/**
 * Frozen balance section for account detail screens — card surface, 16px padding,
 * unified balance sign/color foundation.
 */
export function AccountDetailsBalanceCard({
  label,
  amount,
  locale,
  meta,
  amountAction,
  footer,
}: AccountDetailsBalanceCardProps) {
  const balanceDisplay = getAccountDetailsBalanceDisplayProps();

  return (
    <WidgetCard elevated paddingClass={ACCOUNT_DETAILS_SECTION_PADDING_CLASS}>
      <MetricHero
        label={label}
        amount={amount}
        locale={locale}
        meta={meta}
        metaClassName={accountDetailsBalanceMetaClassName()}
        amountSignMode={balanceDisplay.signMode}
        amountClassName={balanceDisplay.className}
        amountAction={amountAction}
      />
      {footer}
    </WidgetCard>
  );
}
