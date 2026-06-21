"use client";

import {
  ArrowDownLeft,
  ArrowUpRight,
  ChevronRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { CreditCardPaymentSheet } from "@/components/credit-cards/credit-card-payment-sheet";
import { CreditCardPurchaseSheet } from "@/components/credit-cards/credit-card-purchase-sheet";
import { ScreenBody, ScreenHeader } from "@/components/layout/screen-header";
import { Card } from "@/components/ui/card";
import { formatAccountDestinationDisplay } from "@/lib/finance/account-display";
import { useFinance } from "@/lib/finance/store";
import { getSupabaseErrorMessage, logSupabaseError } from "@/lib/supabase/errors";
import { useT } from "@/providers/i18n-provider";
import { useToast } from "@/providers/toast-provider";

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
  const { showToast } = useToast();
  const {
    getAccount,
    getCreditCardByAccountId,
    accounts,
    addCreditCardPurchase,
    makeCreditCardPayment,
  } = useFinance();

  const [showPurchaseSheet, setShowPurchaseSheet] = useState(false);
  const [showPaymentSheet, setShowPaymentSheet] = useState(false);

  const account = getAccount(accountId);
  const creditCard = getCreditCardByAccountId(accountId);

  const linkedAccountLabel = useMemo(() => {
    if (!creditCard?.paymentSourceAccountId) {
      return null;
    }
    const source = accounts.find(
      (item) => item.id === creditCard.paymentSourceAccountId,
    );
    return source
      ? formatAccountDestinationDisplay(source, t)
      : null;
  }, [creditCard, accounts, t]);

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
    if (type === "purchase") {
      setShowPurchaseSheet(true);
      return;
    }
    setShowPaymentSheet(true);
  }

  return (
    <>
      <ScreenHeader
        mode="stack"
        title={t("creditCards.activity.title")}
        onBack={() => router.back()}
      />
      <ScreenBody withTabBar={false} className="space-y-4">
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

      <CreditCardPurchaseSheet
        open={showPurchaseSheet}
        onOpenChange={setShowPurchaseSheet}
        onSubmit={async (input) => {
          try {
            await addCreditCardPurchase(accountId, input);
            showToast(t("creditCards.purchase.success"));
            router.back();
          } catch (error) {
            logSupabaseError("addCreditCardPurchase", error);
            showToast(getSupabaseErrorMessage(error) || t("common.retry"));
            throw error;
          }
        }}
      />

      <CreditCardPaymentSheet
        open={showPaymentSheet}
        onOpenChange={setShowPaymentSheet}
        linkedAccountLabel={linkedAccountLabel}
        onSubmit={async (input) => {
          if (!creditCard.paymentSourceAccountId) {
            showToast(t("creditCards.validation.linkedAccountRequired"));
            throw new Error("Linked account required");
          }
          try {
            await makeCreditCardPayment(accountId, {
              ...input,
              paymentSourceAccountId: creditCard.paymentSourceAccountId,
            });
            showToast(t("creditCards.payment.success"));
            router.back();
          } catch (error) {
            logSupabaseError("makeCreditCardPayment", error);
            showToast(getSupabaseErrorMessage(error) || t("common.retry"));
            throw error;
          }
        }}
      />
    </>
  );
}
