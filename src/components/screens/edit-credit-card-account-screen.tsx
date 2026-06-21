"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { CreditCardFormFields } from "@/components/accounts/credit-card-form-fields";
import { ScreenBody, ScreenHeader } from "@/components/layout/screen-header";
import { StickyFooter } from "@/components/patterns";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  creditCardFormValuesFromAccount,
  parseCreditCardDay,
  parseOptionalCreditLimit,
  validateCreditCardForm,
  type CreditCardFormValues,
} from "@/lib/credit-cards/form";
import { filterTransferAccounts } from "@/lib/finance/account-capabilities";
import { parseOptionalIdentifierLast4 } from "@/lib/finance/account-identifier";
import { useFinance } from "@/lib/finance/store";
import { getSupabaseErrorMessage, logSupabaseError } from "@/lib/supabase/errors";
import { getAmountInputLocale } from "@/lib/i18n/locale";
import { useNavigationGuard } from "@/hooks/use-dirty-form-navigation";
import { useT, useLocale } from "@/providers/i18n-provider";
import { useToast } from "@/providers/toast-provider";
import { cn } from "@/lib/utils";

interface EditCreditCardAccountScreenProps {
  accountId: string;
}

export function EditCreditCardAccountScreen({
  accountId,
}: EditCreditCardAccountScreenProps) {
  const t = useT();
  const router = useRouter();
  const { getAccount, getCreditCardByAccountId, isFinanceReady } = useFinance();
  const account = getAccount(accountId);
  const creditCard = getCreditCardByAccountId(accountId);

  if (!isFinanceReady) {
    return (
      <>
        <ScreenHeader mode="stack" title={t("common.loading")} />
        <ScreenBody withTabBar={false}>
          <Skeleton className="h-40 w-full rounded-lg" />
        </ScreenBody>
      </>
    );
  }

  if (!account || account.type !== "credit_card" || !creditCard) {
    return (
      <>
        <ScreenHeader
          mode="stack"
          title={t("accounts.details.notFound")}
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
    <EditCreditCardAccountForm
      accountId={accountId}
      initialValues={creditCardFormValuesFromAccount(account, creditCard)}
    />
  );
}

function EditCreditCardAccountForm({
  accountId,
  initialValues,
}: {
  accountId: string;
  initialValues: CreditCardFormValues;
}) {
  const t = useT();
  const locale = useLocale();
  const amountInputLocale = getAmountInputLocale(locale);
  const router = useRouter();
  const { accounts, updateCreditCard } = useFinance();
  const { showToast } = useToast();

  const [values, setValues] = useState(initialValues);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const paymentSourceAccounts = useMemo(
    () => filterTransferAccounts(accounts, { excludeAccountIds: [accountId] }),
    [accounts, accountId],
  );

  const isDirty = useMemo(
    () => JSON.stringify(values) !== JSON.stringify(initialValues),
    [values, initialValues],
  );

  function clearFieldError(field: string) {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  async function handleSubmit() {
    const nextErrors = validateCreditCardForm(values, t, "edit");
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const statementCloseDay = parseCreditCardDay(values.statementCloseDay);
    const paymentDueDay = parseCreditCardDay(values.paymentDueDay);
    if (statementCloseDay === null || paymentDueDay === null) return;

    setSubmitting(true);
    try {
      await updateCreditCard(accountId, {
        name: values.name.trim(),
        institution: values.institution.trim() || null,
        cardNumberLast4: parseOptionalIdentifierLast4(values.identifier),
        statementCloseDay,
        paymentDueDay,
        creditLimit: parseOptionalCreditLimit(values.creditLimit),
        paymentSourceAccountId: values.paymentSourceAccountId ?? undefined,
        clearPaymentSource: values.paymentSourceAccountId === null,
        includeInNetWorth: values.includeInNetWorth,
        includeInEmergencyFund: values.includeInEmergencyFund,
      });
      showToast(t("creditCards.edit.success"));
      router.replace(`/accounts/${accountId}`);
    } catch (error) {
      logSupabaseError("updateCreditCard", error);
      setErrors({
        form: getSupabaseErrorMessage(error) || t("common.retry"),
      });
      setSubmitting(false);
    }
  }

  const { handleBack: guardBack } = useNavigationGuard(isDirty);

  function handleBack() {
    if (submitting) return;
    guardBack();
  }

  return (
    <>
      <ScreenHeader
        mode="stack"
        title={t("creditCards.edit.title")}
        onBack={handleBack}
      />
      <ScreenBody withTabBar={false} className="pb-28">
        <CreditCardFormFields
          values={values}
          errors={errors}
          amountInputLocale={amountInputLocale}
          paymentSourceAccounts={paymentSourceAccounts}
          disabled={submitting}
          mode="edit"
          onChange={(patch) => setValues((current) => ({ ...current, ...patch }))}
          onClearError={clearFieldError}
        />
        {errors.form ? (
          <p className="mt-4 text-sm text-destructive">{errors.form}</p>
        ) : null}
      </ScreenBody>
      <StickyFooter>
        <Button
          className={cn("h-11 w-full")}
          disabled={submitting || !isDirty}
          onClick={() => void handleSubmit()}
        >
          {submitting ? t("creditCards.edit.saving") : t("creditCards.edit.submit")}
        </Button>
      </StickyFooter>
    </>
  );
}
