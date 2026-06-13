"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { CertificateFormFields } from "@/components/certificates/certificate-form-fields";
import { ScreenBody, ScreenHeader } from "@/components/layout/screen-header";
import { StickyFooter } from "@/components/patterns";
import { Button } from "@/components/ui/button";
import { DiscardDialog } from "@/components/ui/discard-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  certificateFormValuesFromCertificate,
  isCertificateFormDirty,
  resolveTermMonths,
  validateCertificateForm,
  type CertificateFormValues,
} from "@/lib/certificates/form";
import { parseAmount } from "@/lib/format/currency";
import { useFinance } from "@/lib/finance/store";
import { getAmountInputLocale } from "@/lib/i18n/locale";
import { getSupabaseErrorMessage, logSupabaseError } from "@/lib/supabase/errors";
import { useT, useLocale } from "@/providers/i18n-provider";
import { useToast } from "@/providers/toast-provider";

interface EditCertificateScreenProps {
  accountId: string;
}

interface EditCertificateFormProps {
  accountId: string;
  certificateId: string;
  initialValues: CertificateFormValues;
}

function EditCertificateForm({
  accountId,
  certificateId,
  initialValues,
}: EditCertificateFormProps) {
  const t = useT();
  const locale = useLocale();
  const amountInputLocale = getAmountInputLocale(locale);
  const router = useRouter();
  const { showToast } = useToast();
  const { updateCertificate, refresh } = useFinance();

  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [showDiscard, setShowDiscard] = useState(false);

  const isDirty = isCertificateFormDirty(values, initialValues);

  function clearFieldError(field: string) {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  async function handleSubmit() {
    if (!values) return;
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
      await updateCertificate(certificateId, {
        name: values.name.trim(),
        institution: values.institution.trim() || null,
        principalAmount,
        annualInterestRate,
        purchaseDate: values.purchaseDate,
        termMonths,
        payoutFrequency: values.payoutFrequency,
      });
      showToast(t("certificates.edit.success"));
      router.replace(`/accounts/${accountId}`);
      return;
    } catch (error) {
      logSupabaseError("updateCertificate", error);
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

  return (
    <>
      <ScreenHeader
        mode="stack"
        title={t("certificates.edit.title")}
        onBack={handleBack}
      />
      <ScreenBody withTabBar={false} withStickyFooter onRefresh={refresh}>
        <div className="space-y-6 pt-2">
          <CertificateFormFields
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
          {submitting ? t("certificates.edit.saving") : t("certificates.edit.submit")}
        </Button>
      </StickyFooter>

      <DiscardDialog
        open={showDiscard}
        onConfirm={() => {
          setShowDiscard(false);
          router.back();
        }}
        onCancel={() => setShowDiscard(false)}
      />
    </>
  );
}

export function EditCertificateScreen({ accountId }: EditCertificateScreenProps) {
  const t = useT();
  const router = useRouter();
  const { getAccount, getCertificateByAccountId, isFinanceReady } = useFinance();

  const account = getAccount(accountId);
  const certificate = getCertificateByAccountId(accountId);

  const initialValues = useMemo(() => {
    if (!account || !certificate) return null;
    return certificateFormValuesFromCertificate(certificate, account);
  }, [account, certificate]);

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

  if (!account || !certificate || !initialValues) {
    return (
      <>
        <ScreenHeader
          mode="stack"
          title={t("certificates.details.notFound")}
          onBack={() => router.push("/accounts")}
        />
        <ScreenBody withTabBar={false}>
          <p className="text-muted-foreground">
            {t("certificates.details.notFoundDescription")}
          </p>
        </ScreenBody>
      </>
    );
  }

  return (
    <EditCertificateForm
      key={certificate.id}
      accountId={accountId}
      certificateId={certificate.id}
      initialValues={initialValues}
    />
  );
}
