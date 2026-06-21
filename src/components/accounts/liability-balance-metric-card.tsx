"use client";

import { ResponsiveCurrencyAmount } from "@/components/ui/responsive-currency-amount";
import { WidgetCard } from "@/components/patterns";
import { toDisplayOutstandingBalance } from "@/lib/credit-cards/balance";
import { getBalanceToneClassName } from "@/lib/finance/balance-display";
import { formatRelativeTime } from "@/lib/format/date";
import type { Account } from "@/lib/finance/types";
import { useFormatLocale, useT } from "@/providers/i18n-provider";

interface LiabilityBalanceMetricCardProps {
  account: Account;
  label: string;
  meta?: string;
  subline?: string;
}

export function LiabilityBalanceMetricCard({
  account,
  label,
  meta,
  subline,
}: LiabilityBalanceMetricCardProps) {
  const formatLocale = useFormatLocale();
  const outstanding = toDisplayOutstandingBalance(account.currentBalance);

  return (
    <WidgetCard>
      <p className="text-xs font-medium tracking-wide text-muted-foreground">
        {label}
      </p>
      <div className="mt-1.5 min-w-0">
        <ResponsiveCurrencyAmount
          amount={outstanding}
          locale={formatLocale}
          variant="hero"
          className={getBalanceToneClassName(account)}
        />
      </div>
      {subline ? (
        <p className="mt-2.5 text-[0.9375rem] font-medium leading-snug text-muted-foreground">
          {subline}
        </p>
      ) : null}
      {meta ? (
        <p className="mt-1.5 text-[0.8125rem] leading-normal text-muted-foreground">
          {meta}
        </p>
      ) : null}
    </WidgetCard>
  );
}

export function liabilityBalanceMeta(
  updatedAt: string,
  t: ReturnType<typeof useT>,
  formatLocale: string,
) {
  return t("dashboard.netWorth.updated", {
    time: formatRelativeTime(updatedAt, t, formatLocale),
  });
}
