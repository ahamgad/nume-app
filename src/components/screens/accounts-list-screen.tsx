"use client";

import { Landmark } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { FinanceRefreshErrorNotice } from "@/components/finance/finance-refresh-error-notice";
import { AccountsListSkeleton } from "@/components/accounts/accounts-list-skeleton";
import { AccountCardsSection } from "@/components/accounts/account-cards-section";
import { AccountTypePickerSheet } from "@/components/accounts/account-type-picker-sheet";

import { RootPageHeader, RootPageTitle } from "@/components/layout/stack-page-chrome";
import { ScreenBody, ScreenHeaderActionButton } from "@/components/layout/screen-header";
import { EmptyState } from "@/components/patterns";
import { Button } from "@/components/ui/button";
import {
  ScrollChipSelect,
  type ScrollChipOption,
} from "@/components/ui/scroll-chip-select";
import {
  accountsListHref,
  persistAccountsListFilter,
  resolveAccountsListFilter,
  type AccountsListFilter,
} from "@/lib/accounts/accounts-list-filter";
import { ACCOUNT_CARD_CATEGORY_GAP_PX } from "@/lib/layout/account-card-chrome";
import { useFinance } from "@/lib/finance/store";
import type { Account } from "@/lib/finance/types";
import { useT, useFormatLocale } from "@/providers/i18n-provider";

export function AccountsListScreen() {
  const t = useT();
  const formatLocale = useFormatLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { accounts, certificates, creditCards, loans, isFinanceReady, isFinanceLoadError, refresh } =
    useFinance();
  const [pickerOpen, setPickerOpen] = useState(false);

  const closePicker = useCallback(() => {
    setPickerOpen(false);
  }, []);

  const filter = resolveAccountsListFilter(searchParams);

  useEffect(() => {
    persistAccountsListFilter(filter);
  }, [filter]);

  const setFilter = useCallback(
    (next: AccountsListFilter) => {
      persistAccountsListFilter(next);
      router.replace(accountsListHref(next), { scroll: false });
    },
    [router],
  );

  const filterOptions = useMemo(
    (): ScrollChipOption<AccountsListFilter>[] => [
      { value: "active", label: t("accounts.filters.active") },
      { value: "archived", label: t("accounts.filters.archived") },
    ],
    [t],
  );

  const filteredAccounts = useMemo(
    () =>
      accounts.filter((account) =>
        filter === "active"
          ? account.status === "active"
          : account.status === "archived",
      ),
    [accounts, filter],
  );

  const { moneyAccounts, savingsAccounts, certificateAccounts, liabilityAccounts } =
    useMemo(() => {
    const money: Account[] = [];
    const savings: Account[] = [];
    const certificates: Account[] = [];
    const liabilities: Account[] = [];
    for (const account of filteredAccounts) {
      if (account.type === "certificate") {
        certificates.push(account);
      } else if (account.type === "savings_account") {
        savings.push(account);
      } else if (account.type === "credit_card" || account.type === "loan") {
        liabilities.push(account);
      } else {
        money.push(account);
      }
    }
    return {
      moneyAccounts: money,
      savingsAccounts: savings,
      certificateAccounts: certificates,
      liabilityAccounts: liabilities,
    };
  }, [filteredAccounts]);

  const addAccountAction = (
    <ScreenHeaderActionButton
      label={t("accounts.headerActions.addAccount")}
      onClick={() => setPickerOpen(true)}
    />
  );

  const hasFilteredAccounts = filteredAccounts.length > 0;
  const activeCount = accounts.filter((account) => account.status === "active").length;
  const isFirstTimeEmpty = filter === "active" && activeCount === 0;
  const listHeaderAction = isFirstTimeEmpty ? undefined : addAccountAction;

  if (!isFinanceReady) {
    return (
      <>
        <RootPageHeader title={t("accounts.title")} rightAction={listHeaderAction} />
        <ScreenBody withTabBar onRefresh={refresh}>
          <RootPageTitle>{t("accounts.title")}</RootPageTitle>
          <AccountsListSkeleton />
        </ScreenBody>
      </>
    );
  }

  return (
    <>
      <RootPageHeader title={t("accounts.title")} rightAction={listHeaderAction} />
      <ScreenBody withTabBar onRefresh={refresh}>
        <RootPageTitle>{t("accounts.title")}</RootPageTitle>
        {isFinanceLoadError ? (
          <FinanceRefreshErrorNotice onRetry={() => void refresh()} />
        ) : null}
        <div className="mb-4">
          <ScrollChipSelect
            value={filter}
            options={filterOptions}
            ariaLabel={t("accounts.filters.label")}
            defaultToFirstOption={false}
            onChange={setFilter}
          />
        </div>

        {!hasFilteredAccounts ? (
          filter === "active" && activeCount === 0 ? (
            <EmptyState
              icon={<Landmark />}
              title={t("accounts.empty.title")}
              description={t("accounts.empty.description")}
              action={
                <Button
                  variant="outline"
                  className="h-11 w-full"
                  onClick={() => router.push("/accounts/new")}
                >
                  {t("accounts.empty.action")}
                </Button>
              }
            />
          ) : (
            <EmptyState
              icon={<Landmark />}
              title={t("accounts.archived.empty.title")}
              description={t("accounts.archived.empty.description")}
            />
          )
        ) : (
          <div
            className="flex flex-col"
            style={{ gap: ACCOUNT_CARD_CATEGORY_GAP_PX }}
          >
            <AccountCardsSection
              title={t("accounts.sections.money")}
              accounts={moneyAccounts}
              formatLocale={formatLocale}
              certificates={certificates}
              creditCards={creditCards}
              loans={loans}
              onSelect={(accountId) => router.push(`/accounts/${accountId}`)}
              t={t}
            />
            <AccountCardsSection
              title={t("accounts.sections.savings")}
              accounts={savingsAccounts}
              formatLocale={formatLocale}
              certificates={certificates}
              creditCards={creditCards}
              loans={loans}
              onSelect={(accountId) => router.push(`/accounts/${accountId}`)}
              t={t}
            />
            <AccountCardsSection
              title={t("accounts.sections.certificates")}
              accounts={certificateAccounts}
              formatLocale={formatLocale}
              certificates={certificates}
              creditCards={creditCards}
              loans={loans}
              onSelect={(accountId) => router.push(`/accounts/${accountId}`)}
              t={t}
            />
            <AccountCardsSection
              title={t("accounts.sections.liabilities")}
              accounts={liabilityAccounts}
              formatLocale={formatLocale}
              certificates={certificates}
              creditCards={creditCards}
              loans={loans}
              onSelect={(accountId) => router.push(`/accounts/${accountId}`)}
              t={t}
            />
          </div>
        )}
      </ScreenBody>
      <AccountTypePickerSheet
        open={pickerOpen}
        onClose={closePicker}
      />
    </>
  );
}
