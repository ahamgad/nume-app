"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { CertificateFormFields } from "@/components/certificates/certificate-form-fields";
import { ScreenBody, ScreenHeader } from "@/components/layout/screen-header";
import { StickyFooter } from "@/components/patterns";
import { Button } from "@/components/ui/button";
import { DiscardDialog } from "@/components/ui/discard-dialog";
import {
  DEFAULT_CERTIFICATE_FORM_VALUES,
  resolveTermMonths,
  validateCertificateForm,
  type CertificateFormValues,
} from "@/lib/certificates/form";
import { filterInterestDestinationAccounts } from "@/lib/finance/interest-destination-accounts";
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

export function AddCertificateAccountScreen() {
  const t = useT();
  const locale = useLocale();
  const amountInputLocale = getAmountInputLocale(locale);
  const router = useRouter();
  const { accounts, createCertificate } = useFinance();
  const { showToast } = useToast();

  const [values, setValues] = useState<CertificateFormValues>(
    DEFAULT_CERTIFICATE_FORM_VALUES,
  );
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showDiscard, setShowDiscard] = useState(false);

  const transferAccounts = useMemo(
    () => filterInterestDestinationAccounts(accounts),
    [accounts, t],
  );

  const isDirty =
    values.name.trim().length > 0 ||
    values.institution.trim().length > 0 ||
    values.principalAmount.trim().length > 0 ||
    values.annualInterestRate.trim().length > 0 ||
    values.customTermYears.trim().length > 0 ||
    values.autoApplyInterest ||
    values.renewalType !== "none";

  function clearFieldError(field: string) {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  async function handleSubmit() {
    const nextErrors = validateCertificateForm(values, t);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const principalAmount = parseAmount(values.principalAmount);
    const annualInterestRate = parseAmount(values.annualInterestRate);
    const termMonths = resolveTermMonths(values);
    if (
      principalAmount === null ||
      annualInterestRate === null ||
      termMonths === null
    ) {
      return;
    }

    setSubmitting(true);
    try {
      const certificate = await createCertificate({
        name: values.name.trim(),
        institution: values.institution.trim() || null,
        certificateNumberLast4: parseOptionalIdentifierLast4(values.certificateNumber),
        principalAmount,
        annualInterestRate,
        purchaseDate: values.purchaseDate,
        termMonths,
        payoutFrequency: values.payoutFrequency,
        excludeWeekends: values.excludeWeekends,
        excludeEgyptianHolidays: values.excludeEgyptianHolidays,
        destinationAccountId: values.autoApplyInterest
          ? values.destinationAccountId
          : null,
        autoApply: values.autoApplyInterest,
        renewalType: values.renewalType,
      });
      showToast(t("certificates.create.success"));
      router.replace(`/accounts/${certificate.accountId}`);
    } catch (error) {
      logSupabaseError("createCertificate", error);
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
        title={getAddAccountScreenTitle("certificate", t)}
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
            {t("accounts.add.certificateLead")}
          </p>

          <CertificateFormFields
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
          {submitting
            ? t("certificates.create.creating")
            : t("certificates.create.submit")}
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
