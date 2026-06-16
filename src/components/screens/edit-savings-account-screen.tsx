"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { SavingsFormFields } from "@/components/savings/savings-form-fields";
import { ScreenBody, ScreenHeader } from "@/components/layout/screen-header";
import { StickyFooter } from "@/components/patterns";
import { Button } from "@/components/ui/button";
import { DiscardDialog } from "@/components/ui/discard-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useDirtyFormNavigation } from "@/hooks/use-dirty-form-navigation";
import { filterInterestDestinationAccounts } from "@/lib/finance/interest-destination-accounts";
import {
  isSavingsFormDirty,
  resolveSavingsFormForSubmit,
  savingsFormValuesFromAccount,
  validateSavingsForm,
  type SavingsFormValues,
} from "@/lib/savings/form";
import { useFinance } from "@/lib/finance/store";
import { getAmountInputLocale } from "@/lib/i18n/locale";
import { getSupabaseErrorMessage, logSupabaseError } from "@/lib/supabase/errors";
import { useT, useLocale } from "@/providers/i18n-provider";
import { useToast } from "@/providers/toast-provider";
import { cn } from "@/lib/utils";

interface EditSavingsAccountScreenProps {
  accountId: string;
}

export function EditSavingsAccountScreen({ accountId }: EditSavingsAccountScreenProps) {
  const t = useT();
  const router = useRouter();
  const { getAccount, getSavingsByAccountId, isFinanceReady } = useFinance();
  const account = getAccount(accountId);
  const savings = getSavingsByAccountId(accountId);

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

  if (!account || !savings) {
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
    <EditSavingsAccountForm
      accountId={accountId}
      savingsId={savings.id}
      initialValues={savingsFormValuesFromAccount(account, savings)}
    />
  );
}

function EditSavingsAccountForm({
  accountId,
  savingsId,
  initialValues,
}: {
  accountId: string;
  savingsId: string;
  initialValues: SavingsFormValues;
}) {
  const t = useT();
  const locale = useLocale();
  const amountInputLocale = getAmountInputLocale(locale);
  const router = useRouter();
  const { showToast } = useToast();
  const { updateSavingsAccount, accounts } = useFinance();

  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [showDiscard, setShowDiscard] = useState(false);

  const isDirty = isSavingsFormDirty(values, initialValues);

  const transferAccounts = useMemo(() => {
    const eligible = filterInterestDestinationAccounts(accounts, t, {
      excludeAccountIds: [accountId],
    });
    if (!values.destinationAccountId) return eligible;
    const selected = accounts.find(
      (account) => account.id === values.destinationAccountId,
    );
    if (!selected || eligible.some((account) => account.id === selected.id)) {
      return eligible;
    }
    return [...eligible, selected];
  }, [accounts, accountId, values.destinationAccountId, t]);

  function clearFieldError(field: string) {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  async function handleSubmit() {
    const nextErrors = validateSavingsForm(values, t, "edit");
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const payload = resolveSavingsFormForSubmit(values, "edit");

    setSubmitting(true);
    try {
      await updateSavingsAccount(savingsId, {
        name: payload.name,
        institution: payload.institution,
        interestModel: payload.interestModel,
        annualInterestRate: payload.annualInterestRate,
        tiers: payload.tiers,
        postingFrequency: payload.postingFrequency,
        postingDay: payload.postingDay,
        interestDestination: payload.interestDestination,
        destinationAccountId: payload.destinationAccountId,
      });
      showToast(t("savings.edit.success"));
      router.replace(`/accounts/${accountId}`);
    } catch (error) {
      logSupabaseError("updateSavingsAccount", error);
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
        title={t("savings.edit.title")}
        onBack={handleBack}
      />
      <ScreenBody withTabBar={false} withStickyFooter>
        <div
          className={cn(
            "space-y-6 pt-2",
            submitting && "pointer-events-none opacity-60",
          )}
        >
          <SavingsFormFields
            values={values}
            errors={errors}
            amountInputLocale={amountInputLocale}
            transferAccounts={transferAccounts}
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
          {submitting ? t("savings.edit.saving") : t("savings.edit.submit")}
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
