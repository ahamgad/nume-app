"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { AccountDetailsBalanceCard } from "@/components/accounts/account-details-balance-card";
import {
  AccountDetailsBodySurface,
  AccountDetailsContentHeader,
  AccountDetailsHeaderRegion,
  AccountDetailsStackHeader,
} from "@/components/accounts/account-details-chrome";
import { RecordTypeIcon } from "@/components/finance/record-type-icon";
import { ScreenBody } from "@/components/layout/screen-header";
import { EmptyState, RecordRow } from "@/components/patterns";
import {
  ScrollChipSelect,
  type ScrollChipOption,
} from "@/components/ui/scroll-chip-select";
import { Skeleton } from "@/components/ui/skeleton";
import { toDisplayOutstandingBalance } from "@/lib/credit-cards/balance";
import { formatDisplayDate, formatRelativeTime } from "@/lib/format/date";
import { formatAccountDetailsHeaderSubtitle } from "@/lib/finance/account-display";
import { getAccountDisplayBalance } from "@/lib/finance/balance-display";
import {
  formatRecordLabel,
  formatRecordSubline,
} from "@/lib/finance/record-display";
import { resolveAccountNumberLast4 } from "@/lib/finance/account-identity-validation";
import {
  filterRecordsByMonth,
  type RecordMonthFilter,
} from "@/lib/finance/record-month-filter";
import { CARD_SURFACE_CLASS } from "@/lib/layout/card-surface";
import { ACCOUNT_FORM_SECTION_PADDING_CLASS } from "@/lib/layout/account-form-chrome";
import { ACCOUNT_RECORDS_HISTORY_CARD_GAP_CLASS } from "@/lib/layout/account-details-chrome";
import { useFinance } from "@/lib/finance/store";
import { cn } from "@/lib/utils";
import { useT, useFormatLocale } from "@/providers/i18n-provider";

interface AccountRecordsHistoryScreenProps {
  accountId: string;
}

export function AccountRecordsHistoryScreen({
  accountId,
}: AccountRecordsHistoryScreenProps) {
  const t = useT();
  const formatLocale = useFormatLocale();
  const router = useRouter();
  const {
    getAccount,
    getAccountRecords,
    getCertificateByAccountId,
    getCreditCardByAccountId,
    certificates,
    creditCards,
    loans,
    accounts,
    savingsAccounts,
    records: allFinanceRecords,
    isFinanceReady,
    refresh,
  } = useFinance();
  const [monthFilter, setMonthFilter] = useState<RecordMonthFilter>("this_month");

  const account = getAccount(accountId);
  const allRecords = getAccountRecords(accountId);
  const certificate = getCertificateByAccountId(accountId);
  const creditCard = getCreditCardByAccountId(accountId);

  const headerSubtitle = account
    ? formatAccountDetailsHeaderSubtitle(
        account.type,
        resolveAccountNumberLast4(account, {
          certificates,
          creditCards,
          loans,
        }),
        t,
      )
    : null;

  const balanceMeta = account
    ? t("dashboard.netWorth.updated", {
        time: formatRelativeTime(account.updatedAt, t, formatLocale),
      })
    : undefined;

  const recordSublineParams = useMemo(
    () => ({
      contextAccountId: accountId,
      allRecords: allFinanceRecords,
      accounts,
      savingsAccounts,
      certificates,
      t,
    }),
    [accountId, allFinanceRecords, accounts, savingsAccounts, certificates],
  );

  const filterOptions = useMemo(
    (): ScrollChipOption<RecordMonthFilter>[] => [
      { value: "this_month", label: t("accounts.recordsHistory.filters.thisMonth") },
      { value: "last_month", label: t("accounts.recordsHistory.filters.lastMonth") },
    ],
    [t],
  );

  const filteredRecords = useMemo(
    () => filterRecordsByMonth(allRecords, monthFilter),
    [allRecords, monthFilter],
  );

  if (!isFinanceReady) {
    return (
      <>
        <AccountDetailsStackHeader accountName="" onBack={() => router.back()} />
        <ScreenBody withTabBar={false} className="space-y-4">
          <Skeleton className="h-24 w-full rounded-b-[36px]" />
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-20 w-full rounded-2xl" />
        </ScreenBody>
      </>
    );
  }

  if (!account) {
    return (
      <>
        <AccountDetailsStackHeader
          accountName={t("accounts.details.notFound")}
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

  return (
    <>
      <AccountDetailsStackHeader
        accountName={account.name}
        onBack={() => router.back()}
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
          {account.type === "certificate" && certificate ? (
            <AccountDetailsBalanceCard
              label={t("certificates.fields.principal.label")}
              amount={certificate.principalAmount}
              locale={formatLocale}
              meta={balanceMeta}
            />
          ) : account.type === "credit_card" && creditCard ? (
            <AccountDetailsBalanceCard
              label={t("creditCards.details.outstandingBalance")}
              amount={toDisplayOutstandingBalance(account.currentBalance)}
              locale={formatLocale}
              meta={balanceMeta}
            />
          ) : (
            <AccountDetailsBalanceCard
              label={t("accounts.details.currentBalance")}
              amount={getAccountDisplayBalance(account)}
              locale={formatLocale}
              meta={balanceMeta}
            />
          )}

          <ScrollChipSelect
            value={monthFilter}
            options={filterOptions}
            onChange={setMonthFilter}
            ariaLabel={t("accounts.recordsHistory.filters.label")}
            emphasis="secondary"
            chipSurface="canvas"
          />

          {filteredRecords.length === 0 ? (
            <EmptyState
              title={t("accounts.recordsHistory.empty.title")}
              description={t("accounts.recordsHistory.empty.description")}
            />
          ) : (
            <div
              className={cn("flex flex-col", ACCOUNT_RECORDS_HISTORY_CARD_GAP_CLASS)}
            >
              {filteredRecords.map((record) => (
                <div
                  key={record.id}
                  className={cn(CARD_SURFACE_CLASS, ACCOUNT_FORM_SECTION_PADDING_CLASS)}
                >
                  <RecordRow
                    className="min-h-0 py-0"
                    label={formatRecordLabel(record, t)}
                    amount={record.amount}
                    formatLocale={formatLocale}
                    subline={formatRecordSubline(record, recordSublineParams)}
                    date={formatDisplayDate(record.date, formatLocale)}
                    icon={<RecordTypeIcon type={record.type} />}
                  />
                </div>
              ))}
            </div>
          )}
        </AccountDetailsBodySurface>
      </ScreenBody>
    </>
  );
}
