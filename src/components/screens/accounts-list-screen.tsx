"use client";

import { Landmark, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

import { ScreenBody, ScreenHeader } from "@/components/layout/screen-header";
import { EmptyState, ListRow } from "@/components/patterns";
import { AccountTypeIcon } from "@/components/ui/account-type-icon";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatInstitutionDisplay } from "@/lib/institutions/catalog";
import { getAccountTypeLabelKey } from "@/lib/finance/account-labels";
import { formatCurrency } from "@/lib/format/currency";
import { useFinance } from "@/lib/finance/store";
import type { Account } from "@/lib/finance/types";
import { useT, useFormatLocale } from "@/providers/i18n-provider";

function AddAccountHeaderAction({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex size-11 items-center justify-center rounded-md text-foreground"
      aria-label={label}
    >
      <Plus className="size-5" />
    </button>
  );
}

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
            <ListRow
              primary={account.name}
              leading={<AccountTypeIcon type={account.type} />}
              secondary={
                account.institution
                  ? t("accounts.list.meta", {
                      institution: formatInstitutionDisplay(
                        account.institution,
                        t,
                      ),
                      type: t(getAccountTypeLabelKey(account.type)),
                    })
                  : t(getAccountTypeLabelKey(account.type))
              }
              trailing={formatCurrency(account.currentBalance, formatLocale)}
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
  const { accounts, isFinanceReady, refresh } = useFinance();

  const { moneyAccounts, certificateAccounts } = useMemo(() => {
    const money: Account[] = [];
    const certificates: Account[] = [];
    for (const account of accounts) {
      if (account.type === "certificate") {
        certificates.push(account);
      } else {
        money.push(account);
      }
    }
    return { moneyAccounts: money, certificateAccounts: certificates };
  }, [accounts]);

  const addAccountAction = (
    <AddAccountHeaderAction
      label={t("accounts.addAccount")}
      onClick={() => router.push("/accounts/new")}
    />
  );

  if (!isFinanceReady) {
    return (
      <>
        <ScreenHeader title={t("accounts.title")} rightAction={addAccountAction} />
        <ScreenBody withTabBar onRefresh={refresh}>
          <Skeleton className="mx-auto mt-10 h-8 w-48 rounded-md" />
          <Skeleton className="mx-auto mt-4 h-16 w-full max-w-sm rounded-md" />
        </ScreenBody>
      </>
    );
  }

  const hasAccounts = accounts.length > 0;

  return (
    <>
      <ScreenHeader title={t("accounts.title")} rightAction={addAccountAction} />
      <ScreenBody withTabBar onRefresh={refresh}>
        {!hasAccounts ? (
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
          <div className="space-y-6">
            <AccountSection
              title={t("accounts.sections.money")}
              accounts={moneyAccounts}
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
          </div>
        )}
      </ScreenBody>
    </>
  );
}
