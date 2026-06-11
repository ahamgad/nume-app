"use client";

import { Landmark } from "lucide-react";
import { useRouter } from "next/navigation";

import { ScreenBody, ScreenHeader } from "@/components/layout/screen-header";
import { EmptyState, ListRow } from "@/components/patterns";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/format/currency";
import { useFinance } from "@/lib/finance/store";
import { useT } from "@/providers/i18n-provider";

export function AccountsListScreen() {
  const t = useT();
  const router = useRouter();
  const { accounts, isHydrated } = useFinance();

  if (!isHydrated) {
    return (
      <>
        <ScreenHeader title={t("accounts.title")} />
        <ScreenBody>
          <Skeleton className="mb-4 h-11 w-full rounded-md" />
          <Skeleton className="h-20 w-full rounded-lg" />
        </ScreenBody>
      </>
    );
  }

  return (
    <>
      <ScreenHeader title={t("accounts.title")} />
      <ScreenBody withTabBar>
        <Button
          className="mb-4 h-11 w-full"
          onClick={() => router.push("/accounts/new")}
        >
          {t("accounts.addAccount")}
        </Button>

        {accounts.length === 0 ? (
          <EmptyState
            icon={<Landmark />}
            title={t("accounts.empty.title")}
            description={t("accounts.empty.description")}
            action={
              <Button
                className="h-11 w-full"
                onClick={() => router.push("/accounts/new")}
              >
                {t("accounts.addAccount")}
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
                      t("accounts.types.currentAccount"),
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
