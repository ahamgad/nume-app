"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { CreditCardFormFields } from "@/components/accounts/credit-card-form-fields";
import { AccountFormEditContent } from "@/components/forms/account-form-layout";
import { StackPageHeader, StackPageTitle } from "@/components/layout/stack-page-chrome";
import { ScreenBody, ScreenHeader } from "@/components/layout/screen-header";
import { StickyFooter } from "@/components/patterns";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  creditCardFormValuesFromAccount,
  parseCreditCardStatementDueDay,
  parseCreditLimit,
  validateCreditCardForm,
  type CreditCardFormValues,
} from "@/lib/credit-cards/form";
import { buildAccountIdentityContext } from "@/lib/finance/account-identity-context";
import { getEditAccountScreenTitle } from "@/lib/finance/account-labels";
import { filterTransferAccounts } from "@/lib/finance/account-capabilities";
import { parseOptionalIdentifierLast4 } from "@/lib/finance/account-identifier";
import { useFinance } from "@/lib/finance/store";
import { getSupabaseErrorMessage, logSupabaseError } from "@/lib/supabase/errors";
import { getAmountInputLocale } from "@/lib/i18n/locale";
import { useNavigationGuard } from "@/hooks/use-dirty-form-navigation";
import { useT, useLocale } from "@/providers/i18n-provider";
import { useToast } from "@/providers/toast-provider";

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
  const { accounts, certificates, creditCards, loans, updateCreditCard } = useFinance();
  const identityContext = useMemo(
    () => buildAccountIdentityContext({ accounts, certificates, creditCards, loans }),
    [accounts, certificates, creditCards, loans],
  );
  const { showToast } = useToast();

  const [values, setValues] = useState(initialValues);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const linkedAccounts = useMemo(
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
    const nextErrors = validateCreditCardForm(values, t, "edit", {
      identityContext,
      excludeAccountId: accountId,
    });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const paymentDueDay = parseCreditCardStatementDueDay(values.statementDueDay);
    const creditLimit = parseCreditLimit(values.creditLimit);
    if (paymentDueDay === null || creditLimit === null || !values.linkedAccountId) {
      return;
    }

    setSubmitting(true);
    try {
      await updateCreditCard(accountId, {
        name: values.name.trim(),
        cardNumberLast4: parseOptionalIdentifierLast4(values.identifier),
        paymentDueDay,
        creditLimit,
        linkedAccountId: values.linkedAccountId,
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

  const pageTitle = getEditAccountScreenTitle("credit_card", t);

  return (
    <>
      <StackPageHeader title={pageTitle} onBack={handleBack} />
      <ScreenBody withTabBar={false} withStickyFooter>
        <StackPageTitle>{pageTitle}</StackPageTitle>
        <AccountFormEditContent disabled={submitting} formError={errors.form}>
          <CreditCardFormFields
            values={values}
            errors={errors}
            amountInputLocale={amountInputLocale}
            linkedAccounts={linkedAccounts}
            disabled={submitting}
            mode="edit"
            onChange={(patch) => setValues((current) => ({ ...current, ...patch }))}
            onClearError={clearFieldError}
          />
        </AccountFormEditContent>
      </ScreenBody>
      <StickyFooter>
        <Button
          className="h-12 w-full text-base"
          disabled={submitting}
          onClick={() => void handleSubmit()}
        >
          {submitting ? t("creditCards.edit.saving") : t("creditCards.edit.submit")}
        </Button>
      </StickyFooter>
    </>
  );
}
