"use client";

import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  Plus,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { ScreenBody, ScreenHeader } from "@/components/layout/screen-header";
import {
  MetricHero,
  RecordRow,
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
import { getSupabaseErrorMessage, logSupabaseError } from "@/lib/supabase/errors";
import { useT, useFormatLocale } from "@/providers/i18n-provider";
import { useToast } from "@/providers/toast-provider";

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
  const formatLocale = useFormatLocale();
  const router = useRouter();
  const { showToast } = useToast();
  const { getAccount, getAccountRecords, updateAccount, deleteAccount, isFinanceReady } =
    useFinance();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const account = getAccount(accountId);
  const records = getAccountRecords(accountId).slice(0, 5);

  async function handleDeleteConfirm() {
    if (!account) return;
    setDeleting(true);
    try {
      await deleteAccount(account.id);
      showToast(t("accounts.details.deleteSuccess"));
      router.replace("/accounts");
    } catch (error) {
      logSupabaseError("deleteAccount", error);
      showToast(getSupabaseErrorMessage(error) || t("common.retry"));
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  }

  if (!isFinanceReady) {
    return (
      <>
        <ScreenHeader mode="stack" title={t("common.loading")} />
        <ScreenBody withTabBar={false}>
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
      <ScreenHeader
        mode="stack"
        title={account.name}
        rightAction={
          <button
            type="button"
            onClick={() => router.push(`/accounts/${account.id}/records/new`)}
            className="inline-flex size-11 items-center justify-center rounded-md text-foreground"
            aria-label={t("accounts.details.addRecord")}
          >
            <Plus className="size-5" />
          </button>
        }
      />
      <ScreenBody withTabBar={false} className="space-y-6">
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
            value={formatCurrency(account.currentBalance, formatLocale)}
            meta={t("dashboard.netWorth.updated", {
              time: formatRelativeTime(account.updatedAt, t, formatLocale),
            })}
          />
        </WidgetCard>

        <section>
          <h2 className="mb-2 text-start text-lg font-semibold">
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
          <Button
            variant="outline"
            className="mt-4 h-11 w-full text-destructive hover:text-destructive"
            onClick={() => setShowDeleteConfirm(true)}
          >
            {t("accounts.details.deleteAccount")}
          </Button>
        </section>

        <section>
          <h2 className="mb-2 text-start text-lg font-semibold">
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
                  amount={formatSignedCurrency(record.amount, record.type, formatLocale)}
                  meta={formatDisplayDate(record.date, formatLocale)}
                  icon={recordIcon(record.type)}
                />
              ))}
            </div>
          )}
        </section>
      </ScreenBody>

      {showDeleteConfirm ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-4 pt-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] sm:items-center sm:pb-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-account-title"
            className="w-full max-w-sm rounded-xl border border-border bg-background p-5 shadow-sm"
          >
            <h2 id="delete-account-title" className="text-base font-semibold">
              {t("accounts.details.deleteConfirm.title")}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {t("accounts.details.deleteConfirm.description")}
            </p>
            <div className="mt-5 flex flex-col gap-2">
              <Button
                variant="destructive"
                className="h-11 w-full"
                disabled={deleting}
                onClick={handleDeleteConfirm}
              >
                {deleting
                  ? t("accounts.details.deleteConfirm.deleting")
                  : t("accounts.details.deleteConfirm.confirm")}
              </Button>
              <Button
                variant="ghost"
                className="h-11 w-full"
                disabled={deleting}
                onClick={() => setShowDeleteConfirm(false)}
              >
                {t("accounts.details.deleteConfirm.cancel")}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
