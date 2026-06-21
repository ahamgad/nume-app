"use client";

import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { ScreenBody, ScreenHeader } from "@/components/layout/screen-header";
import {
  EducationalWidget,
  MetricHero,
  RecordRow,
  SetupBanner,
  WidgetCard,
} from "@/components/patterns";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/format/currency";
import { formatDisplayDate, formatRelativeTime } from "@/lib/format/date";
import { useFinance } from "@/lib/finance/store";
import type { FinanceRecord, RecordType } from "@/lib/finance/types";
import { useT, useFormatLocale } from "@/providers/i18n-provider";

function recordIcon(type: RecordType) {
  if (type === "income") return <ArrowDownLeft className="size-4" />;
  if (type === "expense") return <ArrowUpRight className="size-4" />;
  if (type === "interest") return <ArrowDownLeft className="size-4" />;
  if (type === "transfer") return <ArrowLeftRight className="size-4" />;
  return <ArrowLeftRight className="size-4" />;
}

function recordLabel(record: FinanceRecord, t: ReturnType<typeof useT>) {
  if (record.description) return record.description;
  return t(`records.types.${record.type}`);
}

export function DashboardScreen() {
  const t = useT();
  const formatLocale = useFormatLocale();
  const router = useRouter();
  const { accounts, netWorth, recentRecords, certificateInsights, isFinanceReady, isFinanceLoading, refresh } =
    useFinance();

  const hasAccounts = accounts.length > 0;
  const activity = recentRecords(3);
  const latestUpdate = accounts.reduce<string | null>((latest, account) => {
    if (!latest || account.updatedAt > latest) return account.updatedAt;
    return latest;
  }, null);

  return (
    <>
      <ScreenHeader title={t("dashboard.title")} />
      <ScreenBody className="space-y-3" onRefresh={refresh}>
        {isFinanceReady && !hasAccounts ? (
          <SetupBanner
            title={t("dashboard.setup.title")}
            description={t("dashboard.setup.description")}
            actionLabel={t("dashboard.setup.action")}
            onAction={() => router.push("/accounts/new")}
          />
        ) : null}

        <WidgetCard>
          {isFinanceLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-40" />
              <Skeleton className="h-4 w-56" />
            </div>
          ) : (
            <>
              <MetricHero
                label={t("dashboard.netWorth.title")}
                amount={netWorth.netWorth}
                locale={formatLocale}
                subline={t("dashboard.netWorth.subline", {
                  assetsLabel: t("dashboard.netWorth.assets"),
                  assets: formatCurrency(netWorth.assets, formatLocale),
                  liabilitiesLabel: t("dashboard.netWorth.liabilities"),
                  liabilities: formatCurrency(netWorth.liabilities, formatLocale),
                })}
                meta={
                  hasAccounts && latestUpdate
                    ? t("dashboard.netWorth.updated", {
                        time: formatRelativeTime(latestUpdate, t, formatLocale),
                      })
                    : undefined
                }
              />
              {isFinanceReady && !hasAccounts ? (
                <Button
                  className="mt-5 h-11 w-full"
                  onClick={() => router.push("/accounts/new")}
                >
                  {t("dashboard.netWorth.addFirstAccount")}
                </Button>
              ) : null}
            </>
          )}
        </WidgetCard>

        {isFinanceReady && certificateInsights.maturingSoon.length > 0 ? (
          <WidgetCard>
            <h2 className="text-start text-lg font-semibold">
              {t("dashboard.certificates.maturingSoon.title")}
            </h2>
            <div className="mt-2 divide-y divide-border">
              {certificateInsights.maturingSoon.map((item) => (
                <button
                  key={item.certificateId}
                  type="button"
                  className="flex w-full items-center justify-between gap-4 py-3 text-start"
                  onClick={() => router.push(`/accounts/${item.accountId}`)}
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-[0.9375rem] font-medium">
                        {item.name}
                      </p>
                      {item.renewalType !== "none" ? (
                        <span className="shrink-0 rounded-sm bg-muted px-1.5 py-0.5 text-[0.6875rem] text-muted-foreground">
                          {t("dashboard.certificates.autoRenewalIndicator")}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-0.5 text-[0.8125rem] text-muted-foreground">
                      {formatDisplayDate(item.maturityDate, formatLocale)}
                    </p>
                  </div>
                  <span className="shrink-0 text-[0.8125rem] tabular-nums text-muted-foreground">
                    {t("dashboard.certificates.maturingSoon.days", {
                      count: item.daysUntilMaturity,
                    })}
                  </span>
                </button>
              ))}
            </div>
          </WidgetCard>
        ) : null}

        <EducationalWidget
          title={t("dashboard.widgets.financialHealth.title")}
          body={t("dashboard.widgets.financialHealth.body")}
          hint={t("dashboard.widgets.financialHealth.hint")}
        />
        <EducationalWidget
          title={t("dashboard.widgets.emergencyFund.title")}
          body={t("dashboard.widgets.emergencyFund.body")}
          hint={t("dashboard.widgets.emergencyFund.hint")}
        />
        <EducationalWidget
          title={t("dashboard.widgets.cashFlow.title")}
          body={t("dashboard.widgets.cashFlow.body")}
          hint={t("dashboard.widgets.cashFlow.hint")}
        />
        <EducationalWidget
          title={t("dashboard.widgets.goals.title")}
          body={t("dashboard.widgets.goals.body")}
          hint={t("dashboard.widgets.goals.hint")}
        />

        {isFinanceReady && activity.length > 0 ? (
          <WidgetCard>
            <h2 className="text-start text-lg font-semibold">
              {t("dashboard.activity.title")}
            </h2>
            <div className="mt-2 divide-y divide-border">
              {activity.map((record) => {
                const account = accounts.find((a) => a.id === record.accountId);
                return (
                  <RecordRow
                    key={record.id}
                    label={recordLabel(record, t)}
                    amount={record.amount}
                    formatLocale={formatLocale}
                    meta={t("dashboard.activity.recordMeta", {
                      account: account?.name ?? "",
                      date: formatDisplayDate(record.date, formatLocale),
                    })}
                    icon={recordIcon(record.type)}
                    onClick={() =>
                      router.push(`/accounts/${record.accountId}`)
                    }
                  />
                );
              })}
            </div>
          </WidgetCard>
        ) : null}
      </ScreenBody>
    </>
  );
}
