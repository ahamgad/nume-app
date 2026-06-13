"use client";

import { CalendarRange, Target } from "lucide-react";
import { useRouter } from "next/navigation";

import { ScreenBody, ScreenHeader } from "@/components/layout/screen-header";
import { EmptyState } from "@/components/patterns";
import { Button } from "@/components/ui/button";
import { useFinance } from "@/lib/finance/store";
import { useT } from "@/providers/i18n-provider";

export function PlanningScreen() {
  const t = useT();
  const router = useRouter();
  const { accounts, refresh } = useFinance();
  const hasAccounts = accounts.length > 0;

  return (
    <>
      <ScreenHeader title={t("planning.title")} />
      <ScreenBody onRefresh={refresh}>
        <EmptyState
          icon={<CalendarRange />}
          title={t("planning.empty.title")}
          description={t("planning.empty.body")}
          action={
            !hasAccounts ? (
              <Button
                variant="outline"
                className="h-11 w-full"
                onClick={() => router.push("/accounts/new")}
              >
                {t("planning.empty.linkAccounts")}
              </Button>
            ) : undefined
          }
        />
      </ScreenBody>
    </>
  );
}

export function GoalsScreen() {
  const t = useT();
  const router = useRouter();
  const { accounts, refresh } = useFinance();
  const hasAccounts = accounts.length > 0;

  return (
    <>
      <ScreenHeader title={t("goals.title")} />
      <ScreenBody onRefresh={refresh}>
        <EmptyState
          icon={<Target />}
          title={t("goals.empty.title")}
          description={t("goals.empty.body")}
          action={
            !hasAccounts ? (
              <Button
                variant="outline"
                className="h-11 w-full"
                onClick={() => router.push("/accounts/new")}
              >
                {t("goals.empty.linkAccounts")}
              </Button>
            ) : undefined
          }
        />
      </ScreenBody>
    </>
  );
}
