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
import { formatCurrency, formatSignedCurrency } from "@/lib/format/currency";
import { formatDisplayDate, formatRelativeTime } from "@/lib/format/date";
import { useFinance } from "@/lib/finance/store";
import type { FinanceRecord, RecordType } from "@/lib/finance/types";
import { useT } from "@/providers/i18n-provider";

function recordIcon(type: RecordType) {
  if (type === "income") return <ArrowDownLeft className="size-4" />;
  if (type === "expense") return <ArrowUpRight className="size-4" />;
  return <ArrowLeftRight className="size-4" />;
}

function recordLabel(record: FinanceRecord, t: ReturnType<typeof useT>) {
  if (record.description) return record.description;
  return t(`records.types.${record.type}`);
}

function signedRecordAmount(record: FinanceRecord) {
  if (record.type === "adjustment") {
    return formatSignedCurrency(record.amount, "adjustment");
  }
  return formatSignedCurrency(record.amount, record.type);
}

export function DashboardScreen() {
  const t = useT();
  const router = useRouter();
  const { accounts, netWorth, recentRecords, isHydrated } = useFinance();

  const hasAccounts = accounts.length > 0;
  const activity = recentRecords(3);
  const latestUpdate = accounts.reduce<string | null>((latest, account) => {
    if (!latest || account.updatedAt > latest) return account.updatedAt;
    return latest;
  }, null);

  if (!isHydrated) {
    return (
      <>
        <ScreenHeader title={t("dashboard.title")} />
        <ScreenBody className="space-y-3">
          <Skeleton className="h-36 w-full rounded-lg" />
          <Skeleton className="h-28 w-full rounded-lg" />
          <Skeleton className="h-28 w-full rounded-lg" />
        </ScreenBody>
      </>
    );
  }

  return (
    <>
      <ScreenHeader title={t("dashboard.title")} />
      <ScreenBody className="space-y-3">
        {!hasAccounts ? (
          <SetupBanner
            title={t("dashboard.setup.title")}
            description={t("dashboard.setup.description")}
            actionLabel={t("dashboard.setup.action")}
            onAction={() => router.push("/accounts/new")}
          />
        ) : null}

        <WidgetCard>
          <MetricHero
            label={t("dashboard.netWorth.title")}
            value={formatCurrency(netWorth.netWorth)}
            subline={`${t("dashboard.netWorth.assets")} ${formatCurrency(netWorth.assets)} · ${t("dashboard.netWorth.liabilities")} ${formatCurrency(netWorth.liabilities)}`}
            meta={
              hasAccounts && latestUpdate
                ? t("dashboard.netWorth.updated", {
                    time: formatRelativeTime(latestUpdate, t),
                  })
                : undefined
            }
          />
          {!hasAccounts ? (
            <Button
              className="mt-5 h-11 w-full"
              onClick={() => router.push("/accounts/new")}
            >
              {t("dashboard.netWorth.addFirstAccount")}
            </Button>
          ) : null}
        </WidgetCard>

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

        {activity.length > 0 ? (
          <WidgetCard>
            <h2 className="text-lg font-semibold">
              {t("dashboard.activity.title")}
            </h2>
            <div className="mt-2 divide-y divide-border">
              {activity.map((record) => {
                const account = accounts.find((a) => a.id === record.accountId);
                return (
                  <RecordRow
                    key={record.id}
                    label={recordLabel(record, t)}
                    amount={signedRecordAmount(record)}
                    meta={`${account?.name ?? ""} · ${formatDisplayDate(record.date)}`}
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
