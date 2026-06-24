"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { CreditCardPaymentFormFields } from "@/components/credit-cards/credit-card-payment-form-fields";
import { AccountFormEditContent } from "@/components/forms/account-form-layout";
import { StackPageHeader, StackPageTitle } from "@/components/layout/stack-page-chrome";
import { ScreenBody, ScreenHeader } from "@/components/layout/screen-header";
import { StickyFooter } from "@/components/patterns";
import { Button } from "@/components/ui/button";
import { useNavigationGuard } from "@/hooks/use-dirty-form-navigation";
import { filterTransferAccounts } from "@/lib/finance/account-capabilities";
import { validateRecordAmountField } from "@/lib/finance/record-form";
import { parseAmount } from "@/lib/format/currency";
import { todayIsoDate } from "@/lib/format/date";
import { useFinance } from "@/lib/finance/store";
import { getSupabaseErrorMessage, logSupabaseError } from "@/lib/supabase/errors";
import { getAmountInputLocale } from "@/lib/i18n/locale";
import { FORM_PRIMARY_ACTION_BUTTON_CLASS } from "@/lib/layout/form-action-chrome";
import { useT, useLocale } from "@/providers/i18n-provider";
import { useToast } from "@/providers/toast-provider";

interface AddCreditCardPaymentScreenProps {
  accountId: string;
}

export function AddCreditCardPaymentScreen({
  accountId,
}: AddCreditCardPaymentScreenProps) {
  const t = useT();
  const locale = useLocale();
  const amountInputLocale = getAmountInputLocale(locale);
  const router = useRouter();
  const { showToast } = useToast();
  const {
    getAccount,
    getCreditCardByAccountId,
    accounts,
    makeCreditCardPayment,
  } = useFinance();

  const account = getAccount(accountId);
  const creditCard = getCreditCardByAccountId(accountId);

  const paymentSourceAccounts = useMemo(
    () =>
      filterTransferAccounts(accounts, {
        excludeAccountIds: [accountId],
      }),
    [accounts, accountId],
  );

  const linkedDefaultId = creditCard?.paymentSourceAccountId ?? null;

  const [selectedSourceOverride, setSelectedSourceOverride] = useState<
    string | null | undefined
  >(undefined);

  const paymentSourceAccountId =
    selectedSourceOverride !== undefined
      ? selectedSourceOverride
      : linkedDefaultId;
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(todayIsoDate());
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isDirty =
    selectedSourceOverride !== undefined ||
    amount.trim().length > 0 ||
    description.trim().length > 0 ||
    date !== todayIsoDate();

  const { handleBack } = useNavigationGuard(isDirty);

  function clearFieldError(field: string) {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  async function handleSubmit() {
    const nextErrors: Record<string, string> = {};
    const amountError = validateRecordAmountField("expense", amount, t);
    if (amountError) nextErrors.amount = amountError;
    if (!paymentSourceAccountId) {
      nextErrors.paymentSourceAccountId = t(
        "records.validation.fromAccountRequired",
      );
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const parsedAmount = parseAmount(amount);
    if (parsedAmount === null || !paymentSourceAccountId) return;

    setSubmitting(true);
    try {
      await makeCreditCardPayment(accountId, {
        amount: parsedAmount,
        description: description.trim() || null,
        date,
        paymentSourceAccountId,
      });
      showToast(t("creditCards.payment.success"));
      router.replace(`/accounts/${accountId}`);
    } catch (error) {
      logSupabaseError("makeCreditCardPayment", error);
      setErrors({
        form: getSupabaseErrorMessage(error) || t("common.retry"),
      });
    } finally {
      setSubmitting(false);
    }
  }

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
          title={t("creditCards.payment.title")}
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
      <StackPageHeader title={t("creditCards.payment.title")} onBack={handleBack} />
      <ScreenBody withTabBar={false} withStickyFooter>
        <StackPageTitle>{t("creditCards.payment.title")}</StackPageTitle>
        <AccountFormEditContent disabled={submitting} formError={errors.form}>
          <CreditCardPaymentFormFields
            amount={amount}
            description={description}
            date={date}
            paymentSourceAccountId={paymentSourceAccountId}
            paymentSourceAccounts={paymentSourceAccounts}
            amountInputLocale={amountInputLocale}
            errors={errors}
            disabled={submitting}
            onAmountChange={setAmount}
            onDescriptionChange={setDescription}
            onDateChange={setDate}
            onPaymentSourceChange={setSelectedSourceOverride}
            onClearError={clearFieldError}
          />
        </AccountFormEditContent>
      </ScreenBody>

      <StickyFooter>
        <Button
          className={FORM_PRIMARY_ACTION_BUTTON_CLASS}
          disabled={submitting}
          onClick={() => void handleSubmit()}
        >
          {submitting ? t("records.add.saving") : t("common.save")}
        </Button>
      </StickyFooter>
    </>
  );
}
