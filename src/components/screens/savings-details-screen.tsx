"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import {
  AccountDetailsContentHeader,
  AccountDetailsHeaderRegion,
  AccountDetailsStackHeader,
  AccountDetailsDetailRow,
  AccountDetailsSection,
  AccountDetailsToggleSettingRow,
} from "@/components/accounts/account-details-chrome";
import { AccountDetailsSettingsSection } from "@/components/accounts/account-details-settings-section";
import { ArchivedAccountActions } from "@/components/accounts/archived-account-actions";
import { BalanceMetricCard } from "@/components/accounts/balance-metric-card";
import { RecentRecordsSection } from "@/components/accounts/recent-records-section";
import { RecordTypeIcon } from "@/components/finance/record-type-icon";
import { ScreenBody, ScreenHeader, ScreenHeaderActionButton } from "@/components/layout/screen-header";
import { ConfirmBottomSheet } from "@/components/ui/confirm-bottom-sheet";
import { accountsListHref, getPersistedAccountsListFilter } from "@/lib/accounts/accounts-list-filter";
import { formatAccountDestinationDisplay, formatAccountDetailsHeaderSubtitle } from "@/lib/finance/account-display";
import { resolveEffectiveAnnualRate } from "@/lib/savings/interest-engine";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDisplayDate, formatRelativeTime } from "@/lib/format/date";
import { useFinance } from "@/lib/finance/store";
import type { FinanceRecord } from "@/lib/finance/types";
import { getSupabaseErrorMessage, logSupabaseError } from "@/lib/supabase/errors";
import { useT, useFormatLocale } from "@/providers/i18n-provider";
import { useToast } from "@/providers/toast-provider";

interface SavingsDetailsScreenProps {
  accountId: string;
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

  const headerSubtitle = formatAccountDetailsHeaderSubtitle(
    account.type,
    account.accountNumberLast4,
    t,
  );

  return (
    <>
      <AccountDetailsStackHeader
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
        <AccountDetailsHeaderRegion>
          <AccountDetailsContentHeader
            accountName={account.name}
            institution={account.institution}
            institutionSubtitle={headerSubtitle}
            accountType={account.type}
          />
        </AccountDetailsHeaderRegion>

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

        <AccountDetailsSection title={t("savings.details.summary")}>
          <AccountDetailsDetailRow
            label={t("savings.details.interestModel")}
            value={t(
              savings.interestModel === "fixed"
                ? "savings.interestModel.fixed"
                : "savings.interestModel.tiered",
            )}
          />
          <AccountDetailsDetailRow
            label={t("accounts.fields.annualRate.label")}
            value={rateLabel}
          />
          <AccountDetailsDetailRow
            label={t("savings.details.nextPosting")}
            value={
              savings.nextPostingDate
                ? formatDisplayDate(savings.nextPostingDate, formatLocale)
                : t("common.emptyValue")
            }
          />
          <AccountDetailsDetailRow
            label={t("accounts.fields.interestDestination.label")}
            value={destinationLabel}
          />
        </AccountDetailsSection>

        <RecentRecordsSection
          records={records}
          isArchived={isArchived}
          formatLocale={formatLocale}
          recordLabel={(record) => recordLabel(record, t)}
          recordAmount={(record) => record.amount}
          recordMeta={(record) => formatDisplayDate(record.date, formatLocale)}
          recordIcon={(record) => <RecordTypeIcon type={record.type} />}
        />

        {!isArchived ? (
          <AccountDetailsSettingsSection
            title={t("accounts.details.settingsTitle")}
            editLabel={t("accounts.edit.title")}
            archiveLabel={t("accounts.details.archiveAccount")}
            archiveDisabled={archiving}
            onEdit={() => router.push(`/accounts/${account.id}/edit`)}
            onArchive={() => setShowArchiveConfirm(true)}
          >
            <AccountDetailsToggleSettingRow
              label={t("accounts.settings.includeInNetWorth.label")}
              description={t("accounts.settings.includeInNetWorth.description")}
              checked={account.includeInNetWorth}
              onCheckedChange={(checked) =>
                updateAccount(account.id, { includeInNetWorth: checked })
              }
            />
            <AccountDetailsToggleSettingRow
              label={t("accounts.settings.includeInEmergencyFund.label")}
              description={t(
                "accounts.settings.includeInEmergencyFund.description",
              )}
              checked={account.includeInEmergencyFund}
              onCheckedChange={(checked) =>
                updateAccount(account.id, { includeInEmergencyFund: checked })
              }
            />
          </AccountDetailsSettingsSection>
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
