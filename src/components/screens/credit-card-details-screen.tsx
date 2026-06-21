"use client";

import {
  ArrowDownLeft,
  ArrowUpRight,
  CreditCard as CreditCardIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { AccountHeaderMetadata } from "@/components/accounts/account-header-metadata";
import { AccountDetailActions } from "@/components/accounts/account-detail-actions";
import {
  LiabilityBalanceMetricCard,
  liabilityBalanceMeta,
} from "@/components/accounts/liability-balance-metric-card";
import { RecentRecordsSection } from "@/components/accounts/recent-records-section";
import { CreditUtilizationProgress } from "@/components/credit-cards/credit-utilization-progress";
import { ScreenBody, ScreenHeader, ScreenHeaderActionButton } from "@/components/layout/screen-header";
import { ConfirmBottomSheet } from "@/components/ui/confirm-bottom-sheet";
import { accountsListHref, getPersistedAccountsListFilter } from "@/lib/accounts/accounts-list-filter";
import { toStoredCreditCardBalance } from "@/lib/credit-cards/balance";
import {
  calculateAvailableCredit,
  calculateCreditUtilization,
} from "@/lib/credit-cards/utilization";
import { formatAccountDestinationDisplay, formatAccountInstitutionSubtitle } from "@/lib/finance/account-display";
import { formatPostingDayLabel } from "@/lib/savings/posting-schedule";
import { getAccountHeaderStatusFromAccount } from "@/lib/finance/account-header-status";
import { formatCurrency } from "@/lib/format/currency";
import { formatDisplayDate } from "@/lib/format/date";
import { useFinance } from "@/lib/finance/store";
import type { FinanceRecord } from "@/lib/finance/types";
import { getSupabaseErrorMessage, logSupabaseError } from "@/lib/supabase/errors";
import { useT, useFormatLocale } from "@/providers/i18n-provider";
import { useToast } from "@/providers/toast-provider";
import { Skeleton } from "@/components/ui/skeleton";

interface CreditCardDetailsScreenProps {
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
  if (type === "credit_card_payment") {
    return <ArrowDownLeft className="size-4 text-emerald-600" />;
  }
  if (type === "credit_card_purchase") {
    return <ArrowUpRight className="size-4 text-destructive" />;
  }
  return <CreditCardIcon className="size-4" />;
}

function recordLabel(record: FinanceRecord, t: ReturnType<typeof useT>) {
  if (record.description) return record.description;
  return t(`records.types.${record.type}`);
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
    archiveAccount,
    updateAccount,
    isFinanceReady,
    refresh,
  } = useFinance();

  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [archiving, setArchiving] = useState(false);

  const account = getAccount(accountId);
  const creditCard = getCreditCardByAccountId(accountId);
  const records = getAccountRecords(accountId).slice(0, 5);
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

  const utilization = useMemo(() => {
    if (!account || !creditCard) return null;
    return calculateCreditUtilization(
      account.currentBalance,
      creditCard.creditLimit,
    );
  }, [account, creditCard]);

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

  const institutionSubtitle = formatAccountInstitutionSubtitle(
    account.institution,
    creditCard.cardNumberLast4,
    t,
  );

  return (
    <>
      <ScreenHeader
        mode="stack"
        title={t("accounts.details.title")}
        onBack={() => router.back()}
        rightAction={
          !isArchived ? (
            <ScreenHeaderActionButton
              label={t("accounts.headerActions.addActivity")}
              onClick={() => router.push(`/accounts/${account.id}/activity/new`)}
            />
          ) : undefined
        }
      />
      <ScreenBody withTabBar={false} className="space-y-6" onRefresh={refresh}>
        <AccountHeaderMetadata
          accountName={account.name}
          institution={account.institution}
          institutionSubtitle={institutionSubtitle}
          accountType={account.type}
          status={getAccountHeaderStatusFromAccount(account)}
        />

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
          footer={
            utilization !== null ? (
              <CreditUtilizationProgress utilization={utilization} />
            ) : undefined
          }
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
            {t("creditCards.details.summary")}
          </h2>
          <div className="divide-y divide-border rounded-lg border border-border px-4">
            <DetailRow
              label={t("creditCards.details.linkedAccount")}
              value={linkedAccountLabel}
            />
            <DetailRow
              label={t("creditCards.fields.creditLimit.label")}
              value={formatCurrency(creditCard.creditLimit ?? 0, formatLocale)}
            />
            <DetailRow
              label={t("creditCards.details.availableToSpend")}
              value={
                availableToSpend !== null
                  ? formatCurrency(availableToSpend, formatLocale)
                  : t("common.emptyValue")
              }
            />
            <DetailRow
              label={t("creditCards.fields.statementDueDay.label")}
              value={formatPostingDayLabel(creditCard.paymentDueDay, t)}
            />
          </div>
        </section>

        <RecentRecordsSection
          records={records}
          isArchived={isArchived}
          formatLocale={formatLocale}
          recordLabel={(record) => recordLabel(record, t)}
          recordAmount={(record) => record.amount}
          recordMeta={(record) => formatDisplayDate(record.date, formatLocale)}
          recordIcon={(record) => recordIcon(record.type)}
        />
      </ScreenBody>

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
