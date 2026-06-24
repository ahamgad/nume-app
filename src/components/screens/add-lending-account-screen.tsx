"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import {
  LendingAccountFormFields,
  validateLendingAccountForm,
  type LendingAccountFormValues,
} from "@/components/accounts/lending-account-form-fields";
import { AccountFormCreateContent } from "@/components/forms/account-form-layout";
import { StackPageHeader, StackPageTitle } from "@/components/layout/stack-page-chrome";
import { ScreenBody } from "@/components/layout/screen-header";
import { AccountCreateActionButton, StickyFooter } from "@/components/patterns";
import { parseOptionalIdentifierLast4 } from "@/lib/finance/account-identifier";
import { buildAccountIdentityContext } from "@/lib/finance/account-identity-context";
import { getAddAccountScreenTitle } from "@/lib/finance/account-labels";
import { parseAmount } from "@/lib/format/currency";
import { useFinance } from "@/lib/finance/store";
import { getSupabaseErrorMessage, logSupabaseError } from "@/lib/supabase/errors";
import { useNavigationGuard } from "@/hooks/use-dirty-form-navigation";
import { useT, useLocale } from "@/providers/i18n-provider";
import { useToast } from "@/providers/toast-provider";
import { getAmountInputLocale } from "@/lib/i18n/locale";

const EMPTY_VALUES: LendingAccountFormValues = {
  name: "",
  institution: "",
  identifier: "",
  balance: "",
};

export function AddLendingAccountScreen() {
  const t = useT();
  const locale = useLocale();
  const amountInputLocale = getAmountInputLocale(locale);
  const router = useRouter();
  const { createLoan, accounts, certificates, creditCards, loans } = useFinance();
  const identityContext = useMemo(
    () => buildAccountIdentityContext({ accounts, certificates, creditCards, loans }),
    [accounts, certificates, creditCards, loans],
  );
  const { showToast } = useToast();

  const [values, setValues] = useState<LendingAccountFormValues>(EMPTY_VALUES);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isDirty =
    values.name.trim().length > 0 ||
    values.institution.trim().length > 0 ||
    values.identifier.trim().length > 0 ||
    values.balance.trim().length > 0;

  function clearFieldError(field: string) {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  async function handleSubmit() {
    const nextErrors = validateLendingAccountForm(values, t, "create", {
      identityContext,
    });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const parsedBalance = parseAmount(values.balance);
    if (parsedBalance === null) return;

    const identifierLast4 = parseOptionalIdentifierLast4(values.identifier);

    setSubmitting(true);
    try {
      const loan = await createLoan({
        name: values.name.trim(),
        institution: values.institution.trim() || null,
        currentBalance: parsedBalance,
        loanNumberLast4: identifierLast4,
      });
      showToast(t("common.accountCreated"));
      router.replace(`/accounts/${loan.accountId}`);
    } catch (error) {
      logSupabaseError("createLoan", error);
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
      <StackPageHeader title={getAddAccountScreenTitle("loan", t)} onBack={handleBack} />
      <ScreenBody withTabBar={false} className="pb-28">
        <StackPageTitle>{getAddAccountScreenTitle("loan", t)}</StackPageTitle>
        <AccountFormCreateContent
          description={t("accounts.add.lead")}
          disabled={submitting}
          formError={errors.form}
        >
          <LendingAccountFormFields
            values={values}
            errors={errors}
            amountInputLocale={amountInputLocale}
            disabled={submitting}
            mode="create"
            onChange={(patch) => setValues((current) => ({ ...current, ...patch }))}
            onClearError={clearFieldError}
          />
        </AccountFormCreateContent>
      </ScreenBody>
      <StickyFooter>
        <AccountCreateActionButton
          submitting={submitting}
          onClick={() => void handleSubmit()}
        />
      </StickyFooter>
    </>
  );
}
