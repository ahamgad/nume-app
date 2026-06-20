"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  LendingAccountFormFields,
  validateLendingAccountForm,
  type LendingAccountFormValues,
} from "@/components/accounts/lending-account-form-fields";
import { ScreenBody, ScreenHeader } from "@/components/layout/screen-header";
import { StickyFooter } from "@/components/patterns";
import { Button } from "@/components/ui/button";
import { parseOptionalIdentifierLast4 } from "@/lib/finance/account-identifier";
import { getAddAccountScreenTitle } from "@/lib/finance/account-labels";
import { parseAmount } from "@/lib/format/currency";
import { useFinance } from "@/lib/finance/store";
import type { LendingAccountType } from "@/lib/lending/types";
import { getAmountInputLocale } from "@/lib/i18n/locale";
import { getSupabaseErrorMessage, logSupabaseError } from "@/lib/supabase/errors";
import { useNavigationGuard } from "@/hooks/use-dirty-form-navigation";
import { useT, useLocale } from "@/providers/i18n-provider";
import { useToast } from "@/providers/toast-provider";
import { cn } from "@/lib/utils";

const EMPTY_VALUES: LendingAccountFormValues = {
  name: "",
  institution: "",
  identifier: "",
  balance: "",
};

interface AddLendingAccountScreenProps {
  accountType: LendingAccountType;
}

export function AddLendingAccountScreen({ accountType }: AddLendingAccountScreenProps) {
  const t = useT();
  const locale = useLocale();
  const amountInputLocale = getAmountInputLocale(locale);
  const router = useRouter();
  const { createLoan, createCreditCard } = useFinance();
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
    const nextErrors = validateLendingAccountForm(values, t, "create");
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const parsedBalance = parseAmount(values.balance);
    if (parsedBalance === null) return;

    const identifierLast4 = parseOptionalIdentifierLast4(values.identifier);

    setSubmitting(true);
    try {
      if (accountType === "loan") {
        const loan = await createLoan({
          name: values.name.trim(),
          institution: values.institution.trim() || null,
          currentBalance: parsedBalance,
          loanNumberLast4: identifierLast4,
        });
        showToast(t("common.accountCreated"));
        router.replace(`/accounts/${loan.accountId}`);
        return;
      }

      const card = await createCreditCard({
        name: values.name.trim(),
        institution: values.institution.trim() || null,
        currentBalance: parsedBalance,
        cardNumberLast4: identifierLast4,
      });
      showToast(t("common.accountCreated"));
      router.replace(`/accounts/${card.accountId}`);
    } catch (error) {
      logSupabaseError("createLendingAccount", error);
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
        title={getAddAccountScreenTitle(accountType, t)}
        onBack={handleBack}
      />
      <ScreenBody withTabBar={false} className="pb-28">
        <LendingAccountFormFields
          accountType={accountType}
          values={values}
          errors={errors}
          amountInputLocale={amountInputLocale}
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
          {submitting ? t("accounts.creating") : t("accounts.createAccount")}
        </Button>
      </StickyFooter>
    </>
  );
}
