"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import {
  AccountDetailsContentHeader,
  AccountDetailsStackHeader,
} from "@/components/accounts/account-details-chrome";
import { AccountDetailActions } from "@/components/accounts/account-detail-actions";
import { ArchivedAccountActions } from "@/components/accounts/archived-account-actions";
import { BalanceMetricCard } from "@/components/accounts/balance-metric-card";
import { RecentRecordsSection } from "@/components/accounts/recent-records-section";
import { RecordTypeIcon } from "@/components/finance/record-type-icon";
import { ScreenBody, ScreenHeader, ScreenHeaderActionButton } from "@/components/layout/screen-header";
import { ToggleSettingRow } from "@/components/patterns";
import { ConfirmBottomSheet } from "@/components/ui/confirm-bottom-sheet";
import { accountsListHref, getPersistedAccountsListFilter } from "@/lib/accounts/accounts-list-filter";
import { formatAccountDestinationDisplay, formatAccountInstitutionSubtitle } from "@/lib/finance/account-display";
import { getAccountHeaderStatusFromAccount } from "@/lib/finance/account-header-status";
import { resolveEffectiveAnnualRate } from "@/lib/savings/interest-engine";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/format/currency";
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
    restoreAccount,
    deleteAccount,
    accounts,
    isFinanceReady,
    refresh,
  } = useFinance();

  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [deleting, setDeleting] = useState(false);

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
      router.replace(accountsListHref(getPersistedAccountsListFilter()));
    } catch (error) {
      logSupabaseError("archiveAccount", error);
      showToast(getSupabaseErrorMessage(error) || t("common.retry"));
    } finally {
      setArchiving(false);
      setShowArchiveConfirm(false);
    }
  }

  async function handleRestore() {
    if (!account) return;
    setRestoring(true);
    try {
      await restoreAccount(account.id);
      showToast(t("accounts.details.restoreSuccess"));
    } catch (error) {
      logSupabaseError("restoreAccount", error);
      showToast(getSupabaseErrorMessage(error) || t("common.retry"));
    } finally {
      setRestoring(false);
    }
  }

  async function handleDeleteConfirm() {
    if (!account) return;
    setDeleting(true);
    try {
      await deleteAccount(account.id);
      showToast(t("accounts.details.permanentlyDeleteSuccess"));
      router.replace(accountsListHref(getPersistedAccountsListFilter()));
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

  if (!account || !savings) {
    return (
      <>
        <ScreenHeader
          mode="stack"
          title={t("accounts.details.notFound")}
          onBack={() => router.back()}
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
      <AccountDetailsStackHeader
        pageTitle={t("accounts.details.title")}
        accountName={account.name}
        onBack={() => router.back()}
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
        <AccountDetailsContentHeader
          accountName={account.name}
          institution={account.institution}
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
        ) : (
          <ArchivedAccountActions
            restoreLabel={t("accounts.details.restoreAccount")}
            restoreLoadingLabel={t("accounts.details.restoreRestoring")}
            deleteLabel={t("accounts.details.permanentlyDelete")}
            restoring={restoring}
            deleting={deleting}
            onRestore={handleRestore}
            onDelete={() => setShowDeleteConfirm(true)}
          />
        )}

        <RecentRecordsSection
          records={records}
          isArchived={isArchived}
          formatLocale={formatLocale}
          recordLabel={(record) => recordLabel(record, t)}
          recordAmount={(record) => record.amount}
          recordMeta={(record) => formatDisplayDate(record.date, formatLocale)}
          recordIcon={(record) => <RecordTypeIcon type={record.type} />}
        />
      </ScreenBody>

      <ConfirmBottomSheet
        open={showDeleteConfirm}
        titleId="delete-savings-account-title"
        icon="delete"
        title={t("accounts.details.permanentlyDeleteConfirm.title")}
        description={t("accounts.details.permanentlyDeleteConfirm.description")}
        confirmLabel={t("accounts.details.permanentlyDeleteConfirm.confirm")}
        confirmLoadingLabel={t("accounts.details.permanentlyDeleteConfirm.deleting")}
        cancelLabel={t("accounts.details.permanentlyDeleteConfirm.cancel")}
        confirmDisabled={deleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteConfirm(false)}
      />

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
