"use client";

import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  Plus,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { AccountDetailActions } from "@/components/accounts/account-detail-actions";
import { RecentRecordsSection } from "@/components/accounts/recent-records-section";
import { ScreenBody, ScreenHeader, SCREEN_HEADER_ACTION_ICON_CLASS } from "@/components/layout/screen-header";
import { MetricHero, ToggleSettingRow, WidgetCard } from "@/components/patterns";
import { AccountTypeBadge } from "@/components/ui/account-type-icon";
import { ConfirmBottomSheet } from "@/components/ui/confirm-bottom-sheet";
import { formatAccountDestinationDisplay } from "@/lib/finance/account-display";
import { formatPostingDayLabel } from "@/lib/savings/posting-schedule";
import { formatInstitutionEntityLabel } from "@/lib/institutions/catalog";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatSignedCurrency } from "@/lib/format/currency";
import { formatDisplayDate, formatRelativeTime } from "@/lib/format/date";
import { useFinance } from "@/lib/finance/store";
import type { FinanceRecord } from "@/lib/finance/types";
import type { TranslationKey } from "@/lib/i18n";
import { getSupabaseErrorMessage, logSupabaseError } from "@/lib/supabase/errors";
import { useT, useFormatLocale } from "@/providers/i18n-provider";
import { useToast } from "@/providers/toast-provider";

interface SavingsDetailsScreenProps {
  accountId: string;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <span className="text-[0.9375rem] text-muted-foreground">{label}</span>
      <span className="text-end text-[0.9375rem] font-medium tabular-nums">{value}</span>
    </div>
  );
}

function recordIcon(type: FinanceRecord["type"]) {
  if (type === "income" || type === "interest") {
    return <ArrowDownLeft className="size-4" />;
  }
  if (type === "expense") return <ArrowUpRight className="size-4" />;
  return <ArrowLeftRight className="size-4" />;
}

function recordLabel(record: FinanceRecord, t: ReturnType<typeof useT>) {
  if (record.description) return record.description;
  return t(`records.types.${record.type}`);
}

export function SavingsDetailsScreen({ accountId }: SavingsDetailsScreenProps) {
  const t = useT();
  const formatLocale = useFormatLocale();
  const router = useRouter();
  const { showToast } = useToast();
  const {
    getAccount,
    getSavingsByAccountId,
    getAccountRecords,
    updateAccount,
    archiveAccount,
    accounts,
    isFinanceReady,
    refresh,
  } = useFinance();

  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [archiving, setArchiving] = useState(false);

  const account = getAccount(accountId);
  const savings = getSavingsByAccountId(accountId);
  const records = getAccountRecords(accountId).slice(0, 5);
  const isArchived = account?.status === "archived";

  const destinationLabel = useMemo(() => {
    if (!savings) return "—";
    if (savings.interestDestination === "same_account") {
      return t("savings.destination.sameAccount");
    }
    const destination = accounts.find(
      (item) => item.id === savings.destinationAccountId,
    );
    return destination
      ? formatAccountDestinationDisplay(destination, t)
      : t("common.emptyValue");
  }, [savings, accounts, t]);

  const rateLabel = useMemo(() => {
    if (!savings) return "—";
    if (savings.interestModel === "fixed") {
      return savings.annualInterestRate === null
        ? "—"
        : `${savings.annualInterestRate}%`;
    }
    return t("savings.interestModel.tiered");
  }, [savings, t]);

  async function handleArchiveConfirm() {
    if (!account) return;
    setArchiving(true);
    try {
      await archiveAccount(account.id);
      showToast(t("accounts.details.archiveSuccess"));
      router.replace("/accounts");
    } catch (error) {
      logSupabaseError("archiveAccount", error);
      showToast(getSupabaseErrorMessage(error) || t("common.retry"));
    } finally {
      setArchiving(false);
      setShowArchiveConfirm(false);
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

  if (!account || !savings) {
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
        </ScreenBody>
      </>
    );
  }

  return (
    <>
      <ScreenHeader
        mode="stack"
        title={account.name}
        onBack={() => router.push("/accounts")}
        rightAction={
          !isArchived ? (
            <button
              type="button"
              onClick={() => router.push(`/accounts/${account.id}/records/new`)}
              className="inline-flex size-11 items-center justify-center rounded-md text-foreground"
              aria-label={t("accounts.details.addRecord")}
            >
              <Plus className={SCREEN_HEADER_ACTION_ICON_CLASS} />
            </button>
          ) : undefined
        }
      />
      <ScreenBody withTabBar={false} className="space-y-6" onRefresh={refresh}>
        <div>
          {account.institution ? (
            <p className="text-[0.8125rem] text-muted-foreground">
              {formatInstitutionEntityLabel(account.institution, t)}
            </p>
          ) : null}
          <div className="mt-1">
            <AccountTypeBadge type={account.type} />
          </div>
        </div>

        <WidgetCard>
          <MetricHero
            label={t("accounts.details.currentBalance")}
            amount={account.currentBalance}
            locale={formatLocale}
            meta={t("dashboard.netWorth.updated", {
              time: formatRelativeTime(account.updatedAt, t, formatLocale),
            })}
          />
        </WidgetCard>

        {!isArchived ? (
          <AccountDetailActions
            editLabel={t("accounts.edit.title")}
            archiveLabel={t("accounts.details.archiveAccount")}
            disabled={archiving}
            onEdit={() => router.push(`/accounts/${account.id}/edit`)}
            onArchive={() => setShowArchiveConfirm(true)}
          />
        ) : null}

        <section>
          <h2 className="mb-2 text-start text-lg font-semibold">
            {t("accounts.formSections.interestDetails")}
          </h2>
          <WidgetCard>
            <DetailRow
              label={t("savings.details.interestModel")}
              value={t(
                savings.interestModel === "fixed"
                  ? "savings.interestModel.fixed"
                  : "savings.interestModel.tiered",
              )}
            />
            <DetailRow label={t("savings.details.annualRate")} value={rateLabel} />
            <DetailRow
              label={t("savings.fields.cycleStartDate.label")}
              value={formatDisplayDate(savings.cycleStartDate, formatLocale)}
            />
            <DetailRow
              label={t("savings.details.postingSchedule")}
              value={`${t(`savings.postingFrequency.${savings.postingFrequency}` as TranslationKey)} · ${formatPostingDayLabel(savings.postingDay, t)}`}
            />
            <DetailRow
              label={t("savings.details.nextPosting")}
              value={
                savings.nextPostingDate
                  ? formatDisplayDate(savings.nextPostingDate, formatLocale)
                  : t("common.emptyValue")
              }
            />
            <DetailRow
              label={t("savings.details.cycleMinimum")}
              value={formatCurrency(savings.cycleMinimumBalance, formatLocale)}
            />
            <DetailRow
              label={t("savings.details.destination")}
              value={destinationLabel}
            />
          </WidgetCard>
        </section>

        <RecentRecordsSection
          records={records}
          isArchived={isArchived}
          formatLocale={formatLocale}
          recordLabel={(record) => recordLabel(record, t)}
          recordAmount={(record) =>
            formatSignedCurrency(record.amount, record.type, formatLocale)
          }
          recordMeta={(record) => formatDisplayDate(record.date, formatLocale)}
          recordIcon={(record) => recordIcon(record.type)}
        />

        {!isArchived ? (
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
                  updateAccount(account.id, { includeInNetWorth: checked })
                }
              />
              <ToggleSettingRow
                label={t("accounts.settings.includeInEmergencyFund.label")}
                description={t(
                  "accounts.settings.includeInEmergencyFund.description",
                )}
                checked={account.includeInEmergencyFund}
                onCheckedChange={(checked) =>
                  updateAccount(account.id, { includeInEmergencyFund: checked })
                }
              />
            </div>
          </section>
        ) : null}
      </ScreenBody>

      <ConfirmBottomSheet
        open={showArchiveConfirm}
        titleId="archive-savings-account-title"
        icon="archive"
        title={t("accounts.details.archiveConfirm.title")}
        description={t("accounts.details.archiveConfirm.description")}
        confirmLabel={t("accounts.details.archiveConfirm.confirm")}
        confirmLoadingLabel={t("accounts.details.archiveConfirm.archiving")}
        cancelLabel={t("accounts.details.archiveConfirm.cancel")}
        confirmDisabled={archiving}
        onConfirm={handleArchiveConfirm}
        onCancel={() => setShowArchiveConfirm(false)}
      />
    </>
  );
}
