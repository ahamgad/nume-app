"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { AddActivityActionSheet } from "@/components/accounts/add-activity-action-sheet";
import {
  AccountDetailsBodySurface,
  AccountDetailsContentHeader,
  AccountDetailsHeaderRegion,
  AccountDetailsStackHeader,
  AccountDetailsDetailRow,
  AccountDetailsSection,
} from "@/components/accounts/account-details-chrome";
import { AccountDetailsSettingsSection } from "@/components/accounts/account-details-settings-section";
import { ArchivedAccountActions } from "@/components/accounts/archived-account-actions";
import {
  LiabilityBalanceMetricCard,
  liabilityBalanceMeta,
} from "@/components/accounts/liability-balance-metric-card";
import { RecentRecordsSection } from "@/components/accounts/recent-records-section";
import { ACCOUNT_DETAILS_RECENT_RECORDS_LIMIT } from "@/lib/finance/recent-records-display";
import { RecordTypeIcon } from "@/components/finance/record-type-icon";
import { ScreenBody, ScreenHeader, ScreenHeaderActionButton } from "@/components/layout/screen-header";
import { ConfirmBottomSheet } from "@/components/ui/confirm-bottom-sheet";
import { accountsListHref, getPersistedAccountsListFilter } from "@/lib/accounts/accounts-list-filter";
import { toStoredCreditCardBalance } from "@/lib/credit-cards/balance";
import { calculateAvailableCredit } from "@/lib/credit-cards/utilization";
import { formatAccountDestinationDisplay, formatAccountDetailsHeaderSubtitle } from "@/lib/finance/account-display";
import { formatRecordLabel, formatRecordSubline } from "@/lib/finance/record-display";
import { formatPostingDayLabel } from "@/lib/savings/posting-schedule";
import { formatCurrency } from "@/lib/format/currency";
import { formatDisplayDate } from "@/lib/format/date";
import { useFinance } from "@/lib/finance/store";
import { getSupabaseErrorMessage, logSupabaseError } from "@/lib/supabase/errors";
import { useT, useFormatLocale } from "@/providers/i18n-provider";
import { useToast } from "@/providers/toast-provider";
import { Skeleton } from "@/components/ui/skeleton";

interface CreditCardDetailsScreenProps {
  accountId: string;
}

export function CreditCardDetailsScreen({ accountId }: CreditCardDetailsScreenProps) {
  const t = useT();
  const formatLocale = useFormatLocale();
  const router = useRouter();
  const { showToast } = useToast();
  const {
    getAccount,
    getCreditCardByAccountId,
    getAccountRecords,
    accounts,
    records: allFinanceRecords,
    savingsAccounts,
    certificates,
    creditCards,
    archiveAccount,
    restoreAccount,
    deleteAccount,
    updateAccount,
    isFinanceReady,
    refresh,
  } = useFinance();

  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAddActivitySheet, setShowAddActivitySheet] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const account = getAccount(accountId);
  const creditCard = getCreditCardByAccountId(accountId);
  const allRecords = getAccountRecords(accountId);
  const records = allRecords.slice(0, ACCOUNT_DETAILS_RECENT_RECORDS_LIMIT);
  const isArchived = account?.status === "archived";

  const linkedAccountLabel = useMemo(() => {
    if (!creditCard?.paymentSourceAccountId) {
      return t("common.emptyValue");
    }
    const source = accounts.find(
      (item) => item.id === creditCard.paymentSourceAccountId,
    );
    return source
      ? formatAccountDestinationDisplay(source, t)
      : t("common.emptyValue");
  }, [creditCard, accounts, t]);

  const availableToSpend = useMemo(() => {
    if (!account || !creditCard) return null;
    return calculateAvailableCredit(
      account.currentBalance,
      creditCard.creditLimit,
    );
  }, [account, creditCard]);

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

  if (!account || !creditCard) {
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
    creditCard.cardNumberLast4,
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
              label={t("accounts.headerActions.addActivity")}
              onClick={() => setShowAddActivitySheet(true)}
            />
          ) : undefined
        }
      />
      <ScreenBody withTabBar={false} onRefresh={refresh}>
        <AccountDetailsHeaderRegion>
          <AccountDetailsContentHeader
            accountName={account.name}
            institution={account.institution}
            institutionSubtitle={headerSubtitle}
            accountType={account.type}
          />
        </AccountDetailsHeaderRegion>

        <AccountDetailsBodySurface className="space-y-6">
        <LiabilityBalanceMetricCard
          account={account}
          label={t("creditCards.details.outstandingBalance")}
          meta={liabilityBalanceMeta(account.updatedAt, t, formatLocale)}
          editable={!isArchived}
          onBalanceSave={async (outstandingBalance) => {
            await updateAccount(account.id, {
              currentBalance: toStoredCreditCardBalance(outstandingBalance),
            });
          }}
        />

        <AccountDetailsSection title={t("creditCards.details.summary")}>
          <AccountDetailsDetailRow
            label={t("creditCards.details.linkedAccount")}
            value={linkedAccountLabel}
          />
          <AccountDetailsDetailRow
            label={t("creditCards.fields.creditLimit.label")}
            value={formatCurrency(creditCard.creditLimit ?? 0, formatLocale)}
          />
          <AccountDetailsDetailRow
            label={t("creditCards.details.availableToSpend")}
            value={
              availableToSpend !== null
                ? formatCurrency(availableToSpend, formatLocale)
                : t("common.emptyValue")
            }
          />
          <AccountDetailsDetailRow
            label={t("creditCards.fields.statementDueDay.label")}
            value={formatPostingDayLabel(creditCard.paymentDueDay, t)}
          />
        </AccountDetailsSection>

        <RecentRecordsSection
          accountId={account.id}
          records={records}
          totalRecordCount={allRecords.length}
          isArchived={isArchived}
          formatLocale={formatLocale}
          recordLabel={(record) => formatRecordLabel(record, t)}
          recordAmount={(record) => record.amount}
          recordSubline={(record) =>
            formatRecordSubline(record, {
              contextAccountId: account.id,
              allRecords: allFinanceRecords,
              accounts,
              savingsAccounts,
              certificates,
              creditCards,
              t,
            })
          }
          recordDate={(record) =>
            formatDisplayDate(record.date, formatLocale)
          }
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
          />
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
        </AccountDetailsBodySurface>
      </ScreenBody>

      <AddActivityActionSheet
        open={showAddActivitySheet}
        onClose={() => setShowAddActivitySheet(false)}
        accountId={account.id}
      />

      <ConfirmBottomSheet
        open={showDeleteConfirm}
        titleId="delete-credit-card-title"
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
        titleId="archive-credit-card-title"
        icon="archive"
        title={t("accounts.details.archiveConfirm.title")}
        description={t("accounts.details.archiveConfirm.description")}
        confirmLabel={t("accounts.details.archiveConfirm.confirm")}
        confirmLoadingLabel={t("accounts.details.archiveConfirm.archiving")}
        cancelLabel={t("accounts.details.archiveConfirm.cancel")}
        confirmDisabled={archiving}
        onConfirm={() => void handleArchiveConfirm()}
        onCancel={() => setShowArchiveConfirm(false)}
      />
    </>
  );
}
