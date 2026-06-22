"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { CreditCardFormFields } from "@/components/accounts/credit-card-form-fields";
import { StackPageHeader, StackPageTitle } from "@/components/layout/stack-page-chrome";
import { ScreenBody } from "@/components/layout/screen-header";
import { StickyFooter } from "@/components/patterns";
import { Button } from "@/components/ui/button";
import {
  EMPTY_CREDIT_CARD_FORM_VALUES,
  parseCreditCardStatementDueDay,
  parseCreditLimit,
  validateCreditCardForm,
  type CreditCardFormValues,
} from "@/lib/credit-cards/form";
import { getAddAccountScreenTitle } from "@/lib/finance/account-labels";
import { buildAccountIdentityContext } from "@/lib/finance/account-identity-context";
import { filterTransferAccounts } from "@/lib/finance/account-capabilities";
import { parseOptionalIdentifierLast4 } from "@/lib/finance/account-identifier";
import { parseAmount } from "@/lib/format/currency";
import { useFinance } from "@/lib/finance/store";
import { getSupabaseErrorMessage, logSupabaseError } from "@/lib/supabase/errors";
import { getAmountInputLocale } from "@/lib/i18n/locale";
import { useNavigationGuard } from "@/hooks/use-dirty-form-navigation";
import { useT, useLocale } from "@/providers/i18n-provider";
import { useToast } from "@/providers/toast-provider";
import { cn } from "@/lib/utils";

export function AddCreditCardAccountScreen() {
  const t = useT();
  const locale = useLocale();
  const amountInputLocale = getAmountInputLocale(locale);
  const router = useRouter();
  const { accounts, certificates, creditCards, loans, createCreditCard } = useFinance();
  const identityContext = useMemo(
    () => buildAccountIdentityContext({ accounts, certificates, creditCards, loans }),
    [accounts, certificates, creditCards, loans],
  );
  const { showToast } = useToast();

  const [values, setValues] = useState<CreditCardFormValues>(
    EMPTY_CREDIT_CARD_FORM_VALUES,
  );
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const linkedAccounts = useMemo(
    () => filterTransferAccounts(accounts),
    [accounts],
  );

  const isDirty =
    JSON.stringify(values) !== JSON.stringify(EMPTY_CREDIT_CARD_FORM_VALUES);

  function clearFieldError(field: string) {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  async function handleSubmit() {
    const nextErrors = validateCreditCardForm(values, t, "create", { identityContext });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const outstandingBalance = parseAmount(values.outstandingBalance);
    const creditLimit = parseCreditLimit(values.creditLimit);
    const paymentDueDay = parseCreditCardStatementDueDay(values.statementDueDay);
    if (
      outstandingBalance === null ||
      creditLimit === null ||
      paymentDueDay === null ||
      !values.linkedAccountId
    ) {
      return;
    }

    setSubmitting(true);
    try {
      const card = await createCreditCard({
        name: values.name.trim(),
        linkedAccountId: values.linkedAccountId,
        outstandingBalance,
        cardNumberLast4: parseOptionalIdentifierLast4(values.identifier),
        paymentDueDay,
        creditLimit,
      });
      showToast(t("creditCards.create.success"));
      router.replace(`/accounts/${card.accountId}`);
    } catch (error) {
      logSupabaseError("createCreditCard", error);
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

  const pageTitle = getAddAccountScreenTitle("credit_card", t);

  return (
    <>
      <StackPageHeader title={pageTitle} onBack={handleBack} />
      <ScreenBody withTabBar={false} className="pb-28">
        <StackPageTitle>{pageTitle}</StackPageTitle>
        <CreditCardFormFields
          values={values}
          errors={errors}
          amountInputLocale={amountInputLocale}
          linkedAccounts={linkedAccounts}
          disabled={submitting}
          mode="create"
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
          disabled={submitting}
          onClick={() => void handleSubmit()}
        >
          {submitting ? t("creditCards.create.creating") : t("creditCards.create.submit")}
        </Button>
      </StickyFooter>
    </>
  );
}
