"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import {
  LendingAccountFormFields,
  validateLendingAccountForm,
  type LendingAccountFormValues,
} from "@/components/accounts/lending-account-form-fields";
import { ScreenBody, ScreenHeader } from "@/components/layout/screen-header";
import { StickyFooter } from "@/components/patterns";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { parseOptionalIdentifierLast4 } from "@/lib/finance/account-identifier";
import { getAmountInputLocale } from "@/lib/i18n/locale";
import { useFinance } from "@/lib/finance/store";
import type { LendingAccountType } from "@/lib/lending/types";
import { getSupabaseErrorMessage, logSupabaseError } from "@/lib/supabase/errors";
import { useNavigationGuard } from "@/hooks/use-dirty-form-navigation";
import { useT, useLocale } from "@/providers/i18n-provider";
import { useToast } from "@/providers/toast-provider";
import { cn } from "@/lib/utils";

interface EditLendingAccountScreenProps {
  accountId: string;
}

function lendingFormValuesFromAccount(
  account: { name: string; institution: string | null },
  identifier: string,
): LendingAccountFormValues {
  return {
    name: account.name,
    institution: account.institution ?? "",
    identifier,
    balance: "",
  };
}

export function EditLendingAccountScreen({ accountId }: EditLendingAccountScreenProps) {
  const t = useT();
  const router = useRouter();
  const {
    getAccount,
    getLoanByAccountId,
    getCreditCardByAccountId,
    isFinanceReady,
  } = useFinance();
  const account = getAccount(accountId);
  const loan = getLoanByAccountId(accountId);
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

  if (!account || (account.type !== "loan" && account.type !== "credit_card")) {
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

  const accountType = account.type as LendingAccountType;
  const identifier =
    accountType === "loan"
      ? (loan?.loanNumberLast4 ?? "")
      : (creditCard?.cardNumberLast4 ?? "");

  return (
    <EditLendingAccountForm
      accountId={accountId}
      accountType={accountType}
      initialValues={lendingFormValuesFromAccount(account, identifier)}
    />
  );
}

function EditLendingAccountForm({
  accountId,
  accountType,
  initialValues,
}: {
  accountId: string;
  accountType: LendingAccountType;
  initialValues: LendingAccountFormValues;
}) {
  const t = useT();
  const locale = useLocale();
  const amountInputLocale = getAmountInputLocale(locale);
  const router = useRouter();
  const { updateLoan, updateCreditCard } = useFinance();
  const { showToast } = useToast();

  const [values, setValues] = useState(initialValues);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isDirty = useMemo(
    () =>
      values.name.trim() !== initialValues.name.trim() ||
      values.institution.trim() !== initialValues.institution.trim() ||
      values.identifier.trim() !== initialValues.identifier.trim(),
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
    const nextErrors = validateLendingAccountForm(values, t, "edit");
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const identifierLast4 = parseOptionalIdentifierLast4(values.identifier);

    setSubmitting(true);
    try {
      if (accountType === "loan") {
        await updateLoan(accountId, {
          name: values.name.trim(),
          institution: values.institution.trim() || null,
          loanNumberLast4: identifierLast4,
        });
      } else {
        await updateCreditCard(accountId, {
          name: values.name.trim(),
          institution: values.institution.trim() || null,
          cardNumberLast4: identifierLast4,
        });
      }
      showToast(t("accounts.edit.success"));
      router.replace(`/accounts/${accountId}`);
    } catch (error) {
      logSupabaseError("updateLendingAccount", error);
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
        title={t("accounts.edit.title")}
        onBack={handleBack}
      />
      <ScreenBody withTabBar={false} className="pb-28">
        <LendingAccountFormFields
          accountType={accountType}
          values={values}
          errors={errors}
          amountInputLocale={amountInputLocale}
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
          {submitting ? t("accounts.edit.saving") : t("accounts.edit.submit")}
        </Button>
      </StickyFooter>
    </>
  );
}
