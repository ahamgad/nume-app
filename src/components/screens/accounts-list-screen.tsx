"use client";

import { Landmark, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

import { ScreenBody, ScreenHeader } from "@/components/layout/screen-header";
import { EmptyState, ListRow } from "@/components/patterns";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getAccountTypeLabelKey } from "@/lib/finance/account-labels";
import { formatCurrency } from "@/lib/format/currency";
import { useFinance } from "@/lib/finance/store";
import { useT } from "@/providers/i18n-provider";

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

export function AccountsListScreen() {
  const t = useT();
  const router = useRouter();
  const { accounts, isFinanceReady, refresh } = useFinance();

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
          <section>
            <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground">
              {t("accounts.sections.money")}
            </p>
            <Card className="overflow-hidden shadow-none">
              {accounts.map((account, index) => (
                <div key={account.id}>
                  <ListRow
                    primary={account.name}
                    secondary={[
                      account.institution,
                      t(getAccountTypeLabelKey(account.type)),
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                    trailing={formatCurrency(account.currentBalance)}
                    onClick={() => router.push(`/accounts/${account.id}`)}
                  />
                  {index < accounts.length - 1 ? (
                    <div className="mx-4 border-b border-border" />
                  ) : null}
                </div>
              ))}
            </Card>
          </section>
        )}
      </ScreenBody>
    </>
  );
}
