"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { MoneyAccountFormFields } from "@/components/accounts/money-account-form-fields";
import { ScreenBody, ScreenHeader } from "@/components/layout/screen-header";
import { StickyFooter } from "@/components/patterns";
import { Button } from "@/components/ui/button";
import { DiscardDialog } from "@/components/ui/discard-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useDirtyFormNavigation } from "@/hooks/use-dirty-form-navigation";
import { parseOptionalIdentifierLast4 } from "@/lib/finance/account-identifier";
import {
  isMoneyAccountFormDirty,
  moneyAccountFormValuesFromAccount,
  validateMoneyAccountForm,
  type MoneyAccountFormValues,
} from "@/lib/finance/account-form";
import type { MoneyAccountType } from "@/lib/finance/types";
import { getAmountInputLocale } from "@/lib/i18n/locale";
import { useFinance } from "@/lib/finance/store";
import { getSupabaseErrorMessage, logSupabaseError } from "@/lib/supabase/errors";
import { useT, useLocale } from "@/providers/i18n-provider";
import { useToast } from "@/providers/toast-provider";

interface EditAccountScreenProps {
  accountId: string;
}

function EditAccountForm({
  accountId,
  accountType,
  initialValues,
}: {
  accountId: string;
  accountType: MoneyAccountType;
  initialValues: MoneyAccountFormValues;
}) {
  const t = useT();
  const locale = useLocale();
  const amountInputLocale = getAmountInputLocale(locale);
  const router = useRouter();
  const { showToast } = useToast();
  const { updateAccount } = useFinance();

  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [showDiscard, setShowDiscard] = useState(false);

  const isDirty = isMoneyAccountFormDirty(values, initialValues, accountType);

  const { confirmDiscardNavigation } = useDirtyFormNavigation();

  function clearFieldError(field: string) {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  async function handleSubmit() {
    const nextErrors = validateMoneyAccountForm(values, accountType, t, "edit");
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      const patch: Parameters<typeof updateAccount>[1] = {
        name: values.name.trim(),
        institution:
          accountType === "cash" ? null : values.institution.trim() || null,
      };

      if (accountType === "current_account") {
        patch.accountNumberLast4 = parseOptionalIdentifierLast4(
          values.accountNumber,
        );
      }

      await updateAccount(accountId, patch);
      showToast(t("accounts.edit.success"));
      router.replace(`/accounts/${accountId}`);
    } catch (error) {
      logSupabaseError("updateAccount", error);
      setErrors({
        form: getSupabaseErrorMessage(error) || t("common.retry"),
      });
      setSubmitting(false);
    }
  }

  function handleBack() {
    if (isDirty) {
      setShowDiscard(true);
      return;
    }
    router.back();
  }

  function handleDiscardConfirm() {
    setShowDiscard(false);
    confirmDiscardNavigation(() => router.back());
  }

  return (
    <>
      <ScreenHeader
        mode="stack"
        title={t("accounts.edit.title")}
        onBack={handleBack}
      />
      <ScreenBody withTabBar={false} withStickyFooter>
        <div className="space-y-6 pt-2">
          <MoneyAccountFormFields
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
          {submitting ? t("accounts.edit.saving") : t("accounts.edit.submit")}
        </Button>
      </StickyFooter>

      <DiscardDialog
        open={showDiscard}
        onConfirm={handleDiscardConfirm}
        onCancel={() => setShowDiscard(false)}
      />
    </>
  );
}

export function EditAccountScreen({ accountId }: EditAccountScreenProps) {
  const t = useT();
  const router = useRouter();
  const { getAccount, isFinanceReady } = useFinance();

  const account = getAccount(accountId);

  const initialValues = useMemo(() => {
    if (!account) return null;
    if (
      account.type !== "current_account" &&
      account.type !== "wallet" &&
      account.type !== "cash"
    ) {
      return null;
    }
    return moneyAccountFormValuesFromAccount(account, account.type);
  }, [account]);

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

  if (!account || !initialValues) {
    return (
      <>
        <ScreenHeader
          mode="stack"
          title={t("accounts.details.notFound")}
          onBack={() => router.push("/accounts")}
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
    <EditAccountForm
      key={account.id}
      accountId={accountId}
      accountType={account.type as MoneyAccountType}
      initialValues={initialValues}
    />
  );
}
