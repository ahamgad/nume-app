"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { SavingsFormFields } from "@/components/savings/savings-form-fields";
import { ScreenBody, ScreenHeader } from "@/components/layout/screen-header";
import { StickyFooter } from "@/components/patterns";
import { Button } from "@/components/ui/button";
import { buildAccountIdentityContext } from "@/lib/finance/account-identity-context";
import { filterInterestDestinationAccounts } from "@/lib/finance/interest-destination-accounts";
import { getAddAccountScreenTitle } from "@/lib/finance/account-labels";
import {
  DEFAULT_SAVINGS_FORM_VALUES,
  resolveSavingsFormForSubmit,
  validateSavingsForm,
  type SavingsFormValues,
} from "@/lib/savings/form";
import { useFinance } from "@/lib/finance/store";
import { getSupabaseErrorMessage, logSupabaseError } from "@/lib/supabase/errors";
import { getAmountInputLocale } from "@/lib/i18n/locale";
import { useNavigationGuard } from "@/hooks/use-dirty-form-navigation";
import { useT, useLocale } from "@/providers/i18n-provider";
import { useToast } from "@/providers/toast-provider";
import { cn } from "@/lib/utils";

export function AddSavingsAccountScreen() {
  const t = useT();
  const locale = useLocale();
  const amountInputLocale = getAmountInputLocale(locale);
  const router = useRouter();
  const { accounts, certificates, creditCards, loans, createSavingsAccount } = useFinance();
  const identityContext = useMemo(
    () => buildAccountIdentityContext({ accounts, certificates, creditCards, loans }),
    [accounts, certificates, creditCards, loans],
  );
  const { showToast } = useToast();

  const [values, setValues] = useState<SavingsFormValues>(
    DEFAULT_SAVINGS_FORM_VALUES,
  );
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const transferAccounts = useMemo(
    () => filterInterestDestinationAccounts(accounts),
    [accounts, t],
  );

  const isDirty = JSON.stringify(values) !== JSON.stringify(DEFAULT_SAVINGS_FORM_VALUES);

  function clearFieldError(field: string) {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  async function handleSubmit() {
    const nextErrors = validateSavingsForm(values, t, "create", { identityContext });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const payload = resolveSavingsFormForSubmit(values, "create");
    if (payload.openingBalance === undefined) return;

    setSubmitting(true);
    try {
      const savings = await createSavingsAccount({
        name: payload.name,
        institution: payload.institution,
        accountNumberLast4: payload.accountNumberLast4,
        openingBalance: payload.openingBalance,
        interestModel: payload.interestModel,
        annualInterestRate: payload.annualInterestRate,
        tiers: payload.tiers,
        postingFrequency: payload.postingFrequency,
        postingDay: payload.postingDay,
        excludeWeekends: payload.excludeWeekends,
        excludeEgyptianHolidays: payload.excludeEgyptianHolidays,
        interestDestination: payload.interestDestination,
        destinationAccountId: payload.destinationAccountId,
      });
      showToast(t("savings.create.success"));
      router.replace(`/accounts/${savings.accountId}`);
    } catch (error) {
      logSupabaseError("createSavingsAccount", error);
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
        title={getAddAccountScreenTitle("savings_account", t)}
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
            {t("savings.create.lead")}
          </p>

          <SavingsFormFields
            values={values}
            errors={errors}
            amountInputLocale={amountInputLocale}
            transferAccounts={transferAccounts}
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
          {submitting ? t("savings.create.creating") : t("savings.create.submit")}
        </Button>
      </StickyFooter>
    </>
  );
}
