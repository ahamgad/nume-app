"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { CertificateDetailsScreen } from "@/components/screens/certificate-details-screen";
import { CreditCardDetailsScreen } from "@/components/screens/credit-card-details-screen";
import { SavingsDetailsScreen } from "@/components/screens/savings-details-screen";
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
import {
  ToggleSettingRow,
} from "@/components/patterns";
import { Button } from "@/components/ui/button";
import { ConfirmBottomSheet } from "@/components/ui/confirm-bottom-sheet";
import { accountsListHref, getPersistedAccountsListFilter } from "@/lib/accounts/accounts-list-filter";
import { formatAccountInstitutionSubtitle } from "@/lib/finance/account-display";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDisplayDate, formatRelativeTime } from "@/lib/format/date";
import { useFinance } from "@/lib/finance/store";
import type { FinanceRecord } from "@/lib/finance/types";
import { getSupabaseErrorMessage, logSupabaseError } from "@/lib/supabase/errors";
import { useT, useFormatLocale } from "@/providers/i18n-provider";
import { useToast } from "@/providers/toast-provider";

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
  const {
    getAccount,
    getAccountRecords,
    getLoanByAccountId,
    updateAccount,
    archiveAccount,
    restoreAccount,
    deleteAccount,
    isFinanceReady,
  } = useFinance();

  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const account = getAccount(accountId);
  const records = getAccountRecords(accountId).slice(0, 5);
  const loan = getLoanByAccountId(accountId);
  const isArchived = account?.status === "archived";

  const institutionSubtitle = account
    ? formatAccountInstitutionSubtitle(
        account.institution,
        account.type === "current_account"
          ? account.accountNumberLast4
          : account.type === "loan"
            ? (loan?.loanNumberLast4 ?? null)
            : null,
        t,
      )
    : null;

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

  if (!account) {
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
          <Button
            className="mt-4 h-11"
            onClick={() =>
              router.push(accountsListHref(getPersistedAccountsListFilter()))
            }
          >
            {t("accounts.title")}
          </Button>
        </ScreenBody>
      </>
    );
  }

  if (account.type === "certificate") {
    return <CertificateDetailsScreen accountId={accountId} />;
  }

  if (account.type === "savings_account") {
    return <SavingsDetailsScreen accountId={accountId} />;
  }

  if (account.type === "credit_card") {
    return <CreditCardDetailsScreen accountId={accountId} />;
  }

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
      <ScreenBody withTabBar={false} className="space-y-6">
        <AccountDetailsContentHeader
          accountName={account.name}
          institution={account.institution}
          institutionSubtitle={institutionSubtitle}
          accountType={account.type}
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
          recordMeta={(record) =>
            formatDisplayDate(record.date, formatLocale)
          }
          recordIcon={(record) => <RecordTypeIcon type={record.type} />}
        />
      </ScreenBody>

      <ConfirmBottomSheet
        open={showDeleteConfirm}
        titleId="delete-account-title"
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
        titleId="archive-account-title"
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
