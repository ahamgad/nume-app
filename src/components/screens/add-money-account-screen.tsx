"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  MoneyAccountFormFields,
  type MoneyAccountFormValues,
} from "@/components/accounts/money-account-form-fields";
import { ScreenBody, ScreenHeader } from "@/components/layout/screen-header";
import { StickyFooter } from "@/components/patterns";
import { Button } from "@/components/ui/button";
import { DiscardDialog } from "@/components/ui/discard-dialog";
import type { MoneyAccountType } from "@/lib/finance/types";
import { parseOptionalIdentifierLast4 } from "@/lib/finance/account-identifier";
import { getAddAccountScreenTitle } from "@/lib/finance/account-labels";
import { parseAmount } from "@/lib/format/currency";
import { useFinance } from "@/lib/finance/store";
import { getSupabaseErrorMessage, logSupabaseError } from "@/lib/supabase/errors";
import { getAmountInputLocale } from "@/lib/i18n/locale";
import { useDirtyFormNavigation } from "@/hooks/use-dirty-form-navigation";
import { useT, useLocale } from "@/providers/i18n-provider";
import { useToast } from "@/providers/toast-provider";
import { cn } from "@/lib/utils";

const EMPTY_VALUES: MoneyAccountFormValues = {
  name: "",
  institution: "",
  accountNumber: "",
  balance: "",
};

interface AddMoneyAccountScreenProps {
  accountType: MoneyAccountType;
  isFirstAccountFlow?: boolean;
}

export function AddMoneyAccountScreen({
  accountType,
  isFirstAccountFlow = false,
}: AddMoneyAccountScreenProps) {
  const t = useT();
  const locale = useLocale();
  const amountInputLocale = getAmountInputLocale(locale);
  const router = useRouter();
  const { createAccount } = useFinance();
  const { showToast } = useToast();

  const [values, setValues] = useState<MoneyAccountFormValues>(EMPTY_VALUES);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showDiscard, setShowDiscard] = useState(false);

  const isDirty =
    values.name.trim().length > 0 ||
    values.institution.trim().length > 0 ||
    values.accountNumber.trim().length > 0 ||
    values.balance.trim().length > 0;

  function clearFieldError(field: string) {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  function validateForm() {
    const nextErrors: Record<string, string> = {};
    if (!values.name.trim()) {
      nextErrors.name = t("accounts.validation.nameRequired");
    }
    const parsedBalance = parseAmount(values.balance);
    if (parsedBalance === null) {
      nextErrors.balance = t("accounts.validation.balanceRequired");
    } else if (parsedBalance < 0) {
      nextErrors.balance = t("accounts.validation.balanceNegative");
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit() {
    if (!validateForm()) return;
    const parsedBalance = parseAmount(values.balance);
    if (parsedBalance === null) return;

    setSubmitting(true);
    try {
      const account = await createAccount({
        type: accountType,
        name: values.name,
        institution:
          accountType === "cash" ? null : values.institution.trim() || null,
        accountNumberLast4:
          accountType === "current_account"
            ? parseOptionalIdentifierLast4(values.accountNumber)
            : null,
        currentBalance: parsedBalance,
      });
      showToast(t("common.accountCreated"));
      router.replace(`/accounts/${account.id}`);
    } catch (error) {
      logSupabaseError("createAccount", error);
      setErrors({
        form: getSupabaseErrorMessage(error) || t("common.retry"),
      });
      setSubmitting(false);
    }
  }

  function handleBack() {
    if (submitting) return;
    if (isDirty) {
      setShowDiscard(true);
      return;
    }
    router.back();
  }

  const { confirmDiscardNavigation } = useDirtyFormNavigation();

  return (
    <>
      <ScreenHeader
        mode="stack"
        title={
          isFirstAccountFlow
            ? t("accounts.add.firstAccount.title")
            : getAddAccountScreenTitle(accountType, t)
        }
        onBack={handleBack}
      />
      <ScreenBody withTabBar={false} withStickyFooter>
        <div
          className={cn(
            "space-y-6 pt-2",
            submitting && "pointer-events-none opacity-60",
          )}
        >
          <p className="text-[0.9375rem] leading-relaxed text-muted-foreground">
            {isFirstAccountFlow
              ? t("accounts.add.firstAccount.lead")
              : t("accounts.add.lead")}
          </p>

          <MoneyAccountFormFields
            accountType={accountType}
            values={values}
            errors={errors}
            amountInputLocale={amountInputLocale}
            disabled={submitting}
            onChange={(patch) => setValues((current) => ({ ...current, ...patch }))}
            onClearError={clearFieldError}
          />

          {errors.form ? (
            <p className="text-sm text-destructive">{errors.form}</p>
          ) : null}
        </div>
      </ScreenBody>

      <StickyFooter>
        <Button
          className="h-12 w-full text-base"
          disabled={submitting}
          onClick={handleSubmit}
        >
          {submitting
            ? t("accounts.creating")
            : isFirstAccountFlow
              ? t("accounts.add.firstAccount.cta")
              : t("accounts.createAccount")}
        </Button>
      </StickyFooter>

      <DiscardDialog
        open={showDiscard}
        onConfirm={() => {
          setShowDiscard(false);
          confirmDiscardNavigation(() => router.back());
        }}
        onCancel={() => setShowDiscard(false)}
      />
    </>
  );
}
