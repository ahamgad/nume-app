"use client";

import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { ScreenBody, ScreenHeader } from "@/components/layout/screen-header";
import {
  MetricHero,
  RecordRow,
  StickyFooter,
  ToggleSettingRow,
  WidgetCard,
} from "@/components/patterns";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getAccountTypeLabelKey } from "@/lib/finance/account-labels";
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

interface AccountDetailsScreenProps {
  accountId: string;
}

export function AccountDetailsScreen({ accountId }: AccountDetailsScreenProps) {
  const t = useT();
  const router = useRouter();
  const { getAccount, getAccountRecords, updateAccount, isHydrated } =
    useFinance();

  const account = getAccount(accountId);
  const records = getAccountRecords(accountId).slice(0, 5);

  if (!isHydrated) {
    return (
      <>
        <ScreenHeader mode="stack" title="…" />
        <ScreenBody withTabBar={false} withStickyFooter>
          <Skeleton className="h-40 w-full rounded-lg" />
        </ScreenBody>
      </>
    );
  }

  if (!account) {
    return (
      <>
        <ScreenHeader
          mode="stack"
          title={t("accounts.details.notFound")}
          onBack={() => router.push("/accounts")}
        />
        <ScreenBody withTabBar={false}>
          <p className="text-muted-foreground">
            {t("accounts.details.notFoundDescription")}
          </p>
          <Button
            className="mt-4 h-11"
            onClick={() => router.push("/accounts")}
          >
            {t("accounts.title")}
          </Button>
        </ScreenBody>
      </>
    );
  }

  return (
    <>
      <ScreenHeader mode="stack" title={account.name} />
      <ScreenBody withTabBar={false} withStickyFooter className="space-y-6">
        <div>
          {account.institution ? (
            <p className="text-[0.8125rem] text-muted-foreground">
              {account.institution}
            </p>
          ) : null}
          <div className="mt-1 flex flex-wrap gap-2">
            <span className="rounded-sm bg-muted px-2 py-1 text-xs text-muted-foreground">
              {t(getAccountTypeLabelKey(account.type))}
            </span>
            <span className="rounded-sm bg-muted px-2 py-1 text-xs text-muted-foreground">
              {t("common.active")}
            </span>
          </div>
        </div>

        <WidgetCard>
          <MetricHero
            label={t("accounts.details.currentBalance")}
            value={formatCurrency(account.currentBalance)}
            meta={t("dashboard.netWorth.updated", {
              time: formatRelativeTime(account.updatedAt, t),
            })}
          />
        </WidgetCard>

        <section>
          <h2 className="mb-2 text-lg font-semibold">
            {t("accounts.details.settingsTitle")}
          </h2>
          <div className="rounded-lg border border-border px-4">
            <ToggleSettingRow
              label={t("accounts.settings.includeInNetWorth.label")}
              description={t("accounts.settings.includeInNetWorth.description")}
              checked={account.includeInNetWorth}
              onCheckedChange={(checked) =>
                void updateAccount(account.id, { includeInNetWorth: checked })
              }
            />
            <div className="border-t border-border">
              <ToggleSettingRow
                label={t("accounts.settings.includeInEmergencyFund.label")}
                description={t(
                  "accounts.settings.includeInEmergencyFund.description",
                )}
                checked={account.includeInEmergencyFund}
                onCheckedChange={(checked) =>
                  void updateAccount(account.id, {
                    includeInEmergencyFund: checked,
                  })
                }
              />
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold">
            {t("accounts.details.records.title")}
          </h2>
          {records.length === 0 ? (
            <p className="text-[0.9375rem] text-muted-foreground">
              {t("accounts.details.records.empty")}
            </p>
          ) : (
            <div className="divide-y divide-border rounded-lg border border-border px-4">
              {records.map((record) => (
                <RecordRow
                  key={record.id}
                  label={recordLabel(record, t)}
                  amount={formatSignedCurrency(record.amount, record.type)}
                  meta={formatDisplayDate(record.date)}
                  icon={recordIcon(record.type)}
                />
              ))}
            </div>
          )}
        </section>
      </ScreenBody>

      <StickyFooter>
        <Button
          className="h-12 w-full"
          onClick={() => router.push(`/accounts/${account.id}/records/new`)}
        >
          {t("accounts.details.addRecord")}
        </Button>
      </StickyFooter>
    </>
  );
}
