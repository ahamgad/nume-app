"use client";

import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { AccountHeaderMetadata } from "@/components/accounts/account-header-metadata";
import { AccountDetailActions } from "@/components/accounts/account-detail-actions";
import { BalanceMetricCard } from "@/components/accounts/balance-metric-card";
import { RecentRecordsSection } from "@/components/accounts/recent-records-section";
import { ScreenBody, ScreenHeader, ScreenHeaderActionButton } from "@/components/layout/screen-header";
import { ToggleSettingRow } from "@/components/patterns";
import { ConfirmBottomSheet } from "@/components/ui/confirm-bottom-sheet";
import { formatAccountDestinationDisplay, formatAccountInstitutionSubtitle } from "@/lib/finance/account-display";
import { getAccountHeaderStatusFromAccount } from "@/lib/finance/account-header-status";
import { resolveEffectiveAnnualRate } from "@/lib/savings/interest-engine";
import { Skeleton } from "@/components/ui/skeleton";
import { formatSignedCurrency } from "@/lib/format/currency";
import { formatDisplayDate, formatRelativeTime } from "@/lib/format/date";
import { useFinance } from "@/lib/finance/store";
import type { FinanceRecord } from "@/lib/finance/types";
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
    if (!savings || !account) return "—";

    const { rate, belowMinimumTier } = resolveEffectiveAnnualRate(
      savings.interestModel,
      savings.annualInterestRate,
      savings.tiers,
      account.currentBalance,
    );

    if (belowMinimumTier || rate === null || rate <= 0) {
      return t("savings.details.annualRateBelowTier");
    }

    return `${rate}%`;
  }, [savings, account, t]);

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

  const institutionSubtitle = formatAccountInstitutionSubtitle(
    account.institution,
    account.accountNumberLast4,
    t,
  );

  return (
    <>
      <ScreenHeader
        mode="stack"
        title={account.name}
        onBack={() => router.push("/accounts")}
        rightAction={
          !isArchived ? (
            <ScreenHeaderActionButton
              label={t("accounts.headerActions.addRecord")}
              onClick={() => router.push(`/accounts/${account.id}/records/new`)}
            />
          ) : undefined
        }
      />
      <ScreenBody withTabBar={false} className="space-y-6" onRefresh={refresh}>
        <AccountHeaderMetadata
          institutionSubtitle={institutionSubtitle}
          accountType={account.type}
          status={getAccountHeaderStatusFromAccount(account)}
        />

        <BalanceMetricCard
          account={account}
          label={t("accounts.details.currentBalance")}
          meta={t("dashboard.netWorth.updated", {
            time: formatRelativeTime(account.updatedAt, t, formatLocale),
          })}
          editable={!isArchived}
          onBalanceSave={async (balance) => {
            await updateAccount(account.id, { currentBalance: balance });
          }}
        />

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
            {t("savings.details.summary")}
          </h2>
          <div className="divide-y divide-border rounded-lg border border-border px-4">
            <DetailRow
              label={t("savings.details.interestModel")}
              value={t(
                savings.interestModel === "fixed"
                  ? "savings.interestModel.fixed"
                  : "savings.interestModel.tiered",
              )}
            />
            <DetailRow label={t("accounts.fields.annualRate.label")} value={rateLabel} />
            <DetailRow
              label={t("savings.details.nextPosting")}
              value={
                savings.nextPostingDate
                  ? formatDisplayDate(savings.nextPostingDate, formatLocale)
                  : t("common.emptyValue")
              }
            />
            <DetailRow
              label={t("accounts.fields.interestDestination.label")}
              value={destinationLabel}
            />
          </div>
        </section>

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
