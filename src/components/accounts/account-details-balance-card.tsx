"use client";

import type { ReactNode } from "react";

import { MetricHero, WidgetCard } from "@/components/patterns";
import { getBalanceDisplayProps } from "@/lib/finance/balance-display";
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
  /** When true, omits the nested card shell inside the header hero region. */
  embedded?: boolean;
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
  embedded = false,
}: AccountDetailsBalanceCardProps) {
  const balanceDisplay = getBalanceDisplayProps();

  const content = (
    <>
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
    </>
  );

  if (embedded) {
    return (
      <div className={ACCOUNT_DETAILS_SECTION_PADDING_CLASS}>{content}</div>
    );
  }

  return (
    <WidgetCard elevated paddingClass={ACCOUNT_DETAILS_SECTION_PADDING_CLASS}>
      {content}
    </WidgetCard>
  );
}
