"use client";

import { useRouter } from "next/navigation";

import { AddMoneyAccountScreen } from "@/components/screens/add-money-account-screen";
import { ScreenBody, ScreenHeader } from "@/components/layout/screen-header";
import { Skeleton } from "@/components/ui/skeleton";
import { useFinance } from "@/lib/finance/store";
import { useT } from "@/providers/i18n-provider";

export function AddAccountScreen() {
  const t = useT();
  const { accounts, isFinanceReady } = useFinance();

  if (!isFinanceReady) {
    return (
      <>
        <ScreenHeader mode="stack" title={t("common.loading")} />
        <ScreenBody withTabBar={false}>
          <Skeleton className="mt-4 h-10 w-full rounded-md" />
          <Skeleton className="mt-4 h-14 w-full rounded-md" />
          <Skeleton className="mt-4 h-14 w-full rounded-md" />
        </ScreenBody>
      </>
    );
  }

  return <AddMoneyAccountScreen accountType="current_account" isFirstAccountFlow={accounts.length === 0} />;
}
