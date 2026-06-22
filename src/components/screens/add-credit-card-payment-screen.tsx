"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { EditableField } from "@/components/field-editor";
import { StackPageHeader, StackPageTitle } from "@/components/layout/stack-page-chrome";
import { ScreenBody, ScreenHeader } from "@/components/layout/screen-header";
import { StickyFooter } from "@/components/patterns";
import { AccountPicker } from "@/components/ui/account-picker";
import { Button } from "@/components/ui/button";
import { DateField } from "@/components/ui/date-field";
import { Label } from "@/components/ui/label";
import { useNavigationGuard } from "@/hooks/use-dirty-form-navigation";
import { filterTransferAccounts } from "@/lib/finance/account-capabilities";
import { validateRecordAmountField } from "@/lib/finance/record-form";
import {
  formatAmountInput,
  parseAmount,
  sanitizeAmountInput,
} from "@/lib/format/currency";
import { todayIsoDate } from "@/lib/format/date";
import { useFinance } from "@/lib/finance/store";
import { getSupabaseErrorMessage, logSupabaseError } from "@/lib/supabase/errors";
import { getAmountInputLocale } from "@/lib/i18n/locale";
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
      <ScreenBody withTabBar={false} withStickyFooter className="space-y-5">
        <StackPageTitle>{t("creditCards.payment.title")}</StackPageTitle>
        <p className="text-[0.8125rem] text-muted-foreground">{account.name}</p>

        <AccountPicker
          id="cc-payment-source-account"
          label={t("records.fields.transfer.fromAccount")}
          placeholder={t("records.fields.transfer.fromPlaceholder")}
          value={paymentSourceAccountId}
          accounts={paymentSourceAccounts}
          disabled={submitting}
          sheetTitle={t("records.fields.transfer.fromAccount")}
          searchPlaceholder={t("records.fields.transfer.searchPlaceholder")}
          noResultsMessage={t("records.fields.transfer.noResults")}
          onChange={(next) => {
            setSelectedSourceOverride(next);
            setErrors((prev) => {
              if (!prev.paymentSourceAccountId) return prev;
              const updated = { ...prev };
              delete updated.paymentSourceAccountId;
              return updated;
            });
          }}
        />
        {errors.paymentSourceAccountId ? (
          <p className="-mt-3 text-sm text-destructive">
            {errors.paymentSourceAccountId}
          </p>
        ) : null}

        <EditableField
          id="cc-payment-amount"
          label={t("records.fields.amount")}
          mode="numeric"
          inputMode="decimal"
          value={amount}
          placeholder={t("common.currency.zeroPlaceholder")}
          disabled={submitting}
          error={errors.amount}
          prefixLabel={t("common.currency.code")}
          sanitizeInput={sanitizeAmountInput}
          formatDisplay={(value) => formatAmountInput(value, amountInputLocale)}
          validate={(next) => validateRecordAmountField("expense", next, t)}
          onSave={setAmount}
        />

        <EditableField
          id="cc-payment-description"
          label={t("records.fields.description.label")}
          value={description}
          placeholder={t("creditCards.payment.descriptionPlaceholder")}
          disabled={submitting}
          onSave={setDescription}
        />

        <div className="space-y-2">
          <Label htmlFor="cc-payment-date">{t("records.fields.date")}</Label>
          <DateField
            id="cc-payment-date"
            value={date}
            label={t("records.fields.date")}
            disabled={submitting}
            onChange={setDate}
          />
        </div>

        {errors.form ? (
          <p className="text-sm text-destructive">{errors.form}</p>
        ) : null}
      </ScreenBody>

      <StickyFooter>
        <Button
          className="h-12 w-full"
          disabled={submitting || !paymentSourceAccountId}
          onClick={() => void handleSubmit()}
        >
          {submitting ? t("creditCards.payment.saving") : t("creditCards.payment.submit")}
        </Button>
      </StickyFooter>
    </>
  );
}
