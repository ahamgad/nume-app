"use client";

import {
  ArrowDownLeft,
  ArrowUpRight,
  ChevronRight,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { StackPageHeader, StackPageTitle } from "@/components/layout/stack-page-chrome";
import { ScreenBody, ScreenHeader } from "@/components/layout/screen-header";
import { Card } from "@/components/ui/card";
import { useFinance } from "@/lib/finance/store";
import { useT } from "@/providers/i18n-provider";

interface AddCreditCardActivityScreenProps {
  accountId: string;
}

const activityTypes = ["purchase", "payment"] as const;
type CreditCardActivityType = (typeof activityTypes)[number];

function activityIcon(type: CreditCardActivityType) {
  if (type === "purchase") return <ArrowUpRight className="size-5" />;
  return <ArrowDownLeft className="size-5" />;
}

export function AddCreditCardActivityScreen({
  accountId,
}: AddCreditCardActivityScreenProps) {
  const t = useT();
  const router = useRouter();
  const { getAccount, getCreditCardByAccountId } = useFinance();

  const account = getAccount(accountId);
  const creditCard = getCreditCardByAccountId(accountId);

  if (
    !account ||
    !creditCard ||
    account.type !== "credit_card" ||
    account.status === "archived"
  ) {
    return (
      <>
        <ScreenHeader
          mode="stack"
          title={t("creditCards.activity.title")}
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

  function openActivity(type: CreditCardActivityType) {
    router.push(`/accounts/${accountId}/activity/new/${type}`);
  }

  return (
    <>
      <StackPageHeader
        title={t("creditCards.activity.title")}
        onBack={() => router.back()}
      />
      <ScreenBody withTabBar={false} className="space-y-4">
        <StackPageTitle>{t("creditCards.activity.title")}</StackPageTitle>
        <p className="text-[0.8125rem] text-muted-foreground">{account.name}</p>

        <Card className="overflow-hidden shadow-none">
          {activityTypes.map((type, index) => (
            <div key={type}>
              <button
                type="button"
                onClick={() => openActivity(type)}
                className="flex min-h-[4.5rem] w-full items-center gap-4 px-4 py-3 text-start transition-colors active:bg-muted"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  {activityIcon(type)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[0.9375rem] font-semibold">
                    {t(`creditCards.activity.${type}.title`)}
                  </p>
                  <p className="mt-0.5 text-[0.8125rem] text-muted-foreground">
                    {t(`creditCards.activity.${type}.description`)}
                  </p>
                </div>
                <ChevronRight className="size-5 shrink-0 text-muted-foreground rtl:rotate-180" />
              </button>
              {index < activityTypes.length - 1 ? (
                <div className="mx-4 border-b border-border" />
              ) : null}
            </div>
          ))}
        </Card>
      </ScreenBody>
    </>
  );
}
