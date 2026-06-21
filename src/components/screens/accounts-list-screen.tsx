"use client";

import { Landmark } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { AccountsListSkeleton } from "@/components/accounts/accounts-list-skeleton";
import { AccountTypePickerSheet } from "@/components/accounts/account-type-picker-sheet";
import { AccountCardRow } from "@/components/accounts/account-card-row";

import { ScreenBody, ScreenHeader, ScreenHeaderActionButton } from "@/components/layout/screen-header";
import { EmptyState } from "@/components/patterns";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import { useFinance } from "@/lib/finance/store";
import type { Account } from "@/lib/finance/types";
import { useT, useFormatLocale } from "@/providers/i18n-provider";

function AccountSection({
  title,
  accounts,
  formatLocale,
  onSelect,
  t,
}: {
  title: string;
  accounts: Account[];
  formatLocale: string;
  onSelect: (accountId: string) => void;
  t: ReturnType<typeof useT>;
}) {
  if (accounts.length === 0) return null;

  return (
    <section>
      <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground">
        {title}
      </p>
      <Card className="overflow-hidden shadow-none">
        {accounts.map((account, index) => (
          <div key={account.id}>
            <AccountCardRow
              account={account}
              formatLocale={formatLocale}
              t={t}
              onClick={() => onSelect(account.id)}
            />
            {index < accounts.length - 1 ? (
              <div className="mx-4 border-b border-border" />
            ) : null}
          </div>
        ))}
      </Card>
    </section>
  );
}

export function AccountsListScreen() {
  const t = useT();
  const formatLocale = useFormatLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { accounts, isFinanceReady, refresh } = useFinance();
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

  if (!isFinanceReady) {
    return (
      <>
        <ScreenHeader title={t("accounts.title")} rightAction={addAccountAction} />
        <ScreenBody withTabBar onRefresh={refresh}>
          <AccountsListSkeleton />
        </ScreenBody>
      </>
    );
  }

  const hasFilteredAccounts = filteredAccounts.length > 0;
  const activeCount = accounts.filter((account) => account.status === "active").length;

  return (
    <>
      <ScreenHeader title={t("accounts.title")} rightAction={addAccountAction} />
      <ScreenBody withTabBar onRefresh={refresh}>
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
          <div className="space-y-6">
            <AccountSection
              title={t("accounts.sections.money")}
              accounts={moneyAccounts}
              formatLocale={formatLocale}
              onSelect={(accountId) => router.push(`/accounts/${accountId}`)}
              t={t}
            />
            <AccountSection
              title={t("accounts.sections.savings")}
              accounts={savingsAccounts}
              formatLocale={formatLocale}
              onSelect={(accountId) => router.push(`/accounts/${accountId}`)}
              t={t}
            />
            <AccountSection
              title={t("accounts.sections.certificates")}
              accounts={certificateAccounts}
              formatLocale={formatLocale}
              onSelect={(accountId) => router.push(`/accounts/${accountId}`)}
              t={t}
            />
            <AccountSection
              title={t("accounts.sections.liabilities")}
              accounts={liabilityAccounts}
              formatLocale={formatLocale}
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
