"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { CertificateFormFields } from "@/components/certificates/certificate-form-fields";
import { EditableField } from "@/components/field-editor";
import { ScreenBody, ScreenHeader } from "@/components/layout/screen-header";
import { StickyFooter } from "@/components/patterns";
import { Button } from "@/components/ui/button";
import { DiscardDialog } from "@/components/ui/discard-dialog";
import { AccountTypeIcon } from "@/components/ui/account-type-icon";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ScrollChipSelect,
  type ScrollChipOption,
} from "@/components/ui/scroll-chip-select";
import {
  DEFAULT_CERTIFICATE_FORM_VALUES,
  resolveTermMonths,
  validateCertificateForm,
  type CertificateFormValues,
} from "@/lib/certificates/form";
import { InstitutionPicker } from "@/components/ui/institution-picker";
import {
  ADD_ACCOUNT_TYPES,
  isCertificateAccountType,
  ONBOARDING_ACCOUNT_TYPES,
} from "@/lib/finance/add-account-types";
import {
  shouldShowInstitutionPicker,
  type InstitutionPickerContext,
} from "@/lib/institutions/catalog";
import { getAccountTypeLabelKey } from "@/lib/finance/account-labels";
import { filterSettlementAccounts } from "@/lib/finance/account-capabilities";
import type { AccountType, MoneyAccountType } from "@/lib/finance/types";
import {
  formatAmountInput,
  parseAmount,
  sanitizeAmountInput,
} from "@/lib/format/currency";
import { useFinance } from "@/lib/finance/store";
import { getSupabaseErrorMessage, logSupabaseError } from "@/lib/supabase/errors";
import { getAmountInputLocale } from "@/lib/i18n/locale";
import {
  validateAccountBalanceField,
  validateAccountNameField,
} from "@/lib/field-editor/field-validators";
import { useDirtyFormNavigation } from "@/hooks/use-dirty-form-navigation";
import { useT, useLocale } from "@/providers/i18n-provider";
import { useToast } from "@/providers/toast-provider";
import { cn } from "@/lib/utils";

export function AddAccountScreen() {
  const t = useT();
  const { accounts, isFinanceReady } = useFinance();

  if (!isFinanceReady) {
    return (
      <>
        <ScreenHeader mode="stack" title={t("common.loading")} />
        <ScreenBody withTabBar={false}>
          <Skeleton className="mt-4 h-10 w-full rounded-md" />
          <Skeleton className="mt-4 h-14 w-full rounded-md" />
          <Skeleton className="mt-4 h-14 w-full rounded-md" />
        </ScreenBody>
      </>
    );
  }

  return (
    <AddAccountForm isFirstAccountFlow={accounts.length === 0} />
  );
}

interface AddAccountFormProps {
  isFirstAccountFlow: boolean;
}

function AddAccountForm({ isFirstAccountFlow }: AddAccountFormProps) {
  const t = useT();
  const locale = useLocale();
  const amountInputLocale = getAmountInputLocale(locale);
  const router = useRouter();
  const { accounts, createAccount, createCertificate } = useFinance();
  const { showToast } = useToast();

  const [accountType, setAccountType] = useState<AccountType>("current_account");
  const [name, setName] = useState("");
  const [institution, setInstitution] = useState("");
  const [balance, setBalance] = useState("");
  const [certificateValues, setCertificateValues] = useState<CertificateFormValues>(
    DEFAULT_CERTIFICATE_FORM_VALUES,
  );
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showDiscard, setShowDiscard] = useState(false);

  const isCertificate = isCertificateAccountType(accountType);

  const settlementAccounts = useMemo(
    () => filterSettlementAccounts(accounts),
    [accounts],
  );

  const isDirty = isCertificate
    ? certificateValues.name.trim().length > 0 ||
      certificateValues.institution.trim().length > 0 ||
      certificateValues.principalAmount.trim().length > 0 ||
      certificateValues.annualInterestRate.trim().length > 0 ||
      certificateValues.customTermYears.trim().length > 0
    : name.trim().length > 0 ||
      institution.trim().length > 0 ||
      balance.trim().length > 0;

  const accountTypeOptions = useMemo((): ScrollChipOption<AccountType>[] => {
    if (isFirstAccountFlow) {
      return ONBOARDING_ACCOUNT_TYPES.map((option) => ({
        value: option.type,
        label: t(getAccountTypeLabelKey(option.type)),
        icon: <AccountTypeIcon type={option.type} className="size-3.5" />,
        disabled: !option.enabled,
        hint: option.enabled ? undefined : t("accounts.add.comingSoon"),
      }));
    }

    return ADD_ACCOUNT_TYPES.map((type) => ({
      value: type,
      label: t(getAccountTypeLabelKey(type)),
      icon: <AccountTypeIcon type={type} className="size-3.5" />,
    }));
  }, [isFirstAccountFlow, t]);

  function clearFieldError(field: string) {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  function validateMoneyForm() {
    const nextErrors: Record<string, string> = {};
    if (!name.trim()) {
      nextErrors.name = t("accounts.validation.nameRequired");
    }
    const parsedBalance = parseAmount(balance);
    if (parsedBalance === null) {
      nextErrors.balance = t("accounts.validation.balanceRequired");
    } else if (parsedBalance < 0) {
      nextErrors.balance = t("accounts.validation.balanceNegative");
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit() {
    if (isCertificate) {
      const nextErrors = validateCertificateForm(certificateValues, t);
      setErrors(nextErrors);
      if (Object.keys(nextErrors).length > 0) return;

      const principalAmount = parseAmount(certificateValues.principalAmount);
      const annualInterestRate = parseAmount(certificateValues.annualInterestRate);
      const termMonths = resolveTermMonths(certificateValues);
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
          name: certificateValues.name.trim(),
          institution: certificateValues.institution.trim() || null,
          principalAmount,
          annualInterestRate,
          purchaseDate: certificateValues.purchaseDate,
          termMonths,
          payoutFrequency: certificateValues.payoutFrequency,
          destinationAccountId: certificateValues.destinationAccountId,
        });
        showToast(t("certificates.create.success"));
        router.replace(`/accounts/${certificate.accountId}`);
        return;
      } catch (error) {
        logSupabaseError("createCertificate", error);
        setErrors({
          form: getSupabaseErrorMessage(error) || t("common.retry"),
        });
        setSubmitting(false);
      }
      return;
    }

    if (!validateMoneyForm()) return;
    const parsedBalance = parseAmount(balance);
    if (parsedBalance === null) return;

    setSubmitting(true);
    try {
      const account = await createAccount({
        type: accountType as MoneyAccountType,
        name,
        institution:
          accountType === "cash" ? null : institution.trim() || null,
        currentBalance: parsedBalance,
      });
      showToast(t("common.accountCreated"));
      router.replace(`/accounts/${account.id}`);
      return;
    } catch (error) {
      logSupabaseError("createAccount", error);
      setErrors({
        form: getSupabaseErrorMessage(error) || t("common.retry"),
      });
      setSubmitting(false);
    }
  }

  function handleAccountTypeChange(type: AccountType) {
    setAccountType(type);
    setErrors({});
    setInstitution("");
    if (isCertificateAccountType(type)) {
      setCertificateValues(DEFAULT_CERTIFICATE_FORM_VALUES);
    }
  }

  const showMoneyInstitutionPicker = shouldShowInstitutionPicker(
    accountType as InstitutionPickerContext,
  );

  function handleBack() {
    if (submitting) return;
    if (isDirty) {
      setShowDiscard(true);
      return;
    }
    router.back();
  }

  const { confirmDiscardNavigation } = useDirtyFormNavigation();

  function handleDiscardConfirm() {
    setShowDiscard(false);
    confirmDiscardNavigation(() => router.back());
  }

  return (
    <>
      <ScreenHeader
        mode="stack"
        title={
          isCertificate
            ? t("certificates.create.title")
            : isFirstAccountFlow
              ? t("accounts.add.firstAccount.title")
              : t("accounts.add.title")
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
            {isCertificate
              ? t("accounts.add.certificateLead")
              : isFirstAccountFlow
                ? t("accounts.add.firstAccount.lead")
                : t("accounts.add.lead")}
          </p>

          <div className="space-y-2">
            <Label>{t("accounts.add.chooseType")}</Label>
            <ScrollChipSelect
              value={accountType}
              options={accountTypeOptions}
              ariaLabel={t("accounts.add.chooseType")}
              emphasis="primary"
              onChange={handleAccountTypeChange}
            />
          </div>

          {isCertificate ? (
            <CertificateFormFields
              values={certificateValues}
              errors={errors}
              amountInputLocale={amountInputLocale}
              settlementAccounts={settlementAccounts}
              disabled={submitting}
              onChange={(patch) =>
                setCertificateValues((current) => ({ ...current, ...patch }))
              }
              onClearError={clearFieldError}
            />
          ) : (
            <div className="space-y-5">
              <EditableField
                id="account-name"
                label={t("accounts.fields.name.label")}
                value={name}
                placeholder={t("accounts.fields.name.placeholder")}
                disabled={submitting}
                error={errors.name}
                validate={(next) => validateAccountNameField(next, t)}
                onSave={(nextValue) => {
                  setName(nextValue);
                  clearFieldError("name");
                }}
              />

              {showMoneyInstitutionPicker ? (
                <InstitutionPicker
                  key={accountType}
                  id="account-institution"
                  accountType={accountType as InstitutionPickerContext}
                  value={institution}
                  disabled={submitting}
                  onChange={setInstitution}
                />
              ) : null}

              <EditableField
                id="balance"
                label={t("accounts.fields.balance.label")}
                mode="numeric"
                inputMode="decimal"
                value={balance}
                placeholder={t("common.currency.zeroPlaceholder")}
                disabled={submitting}
                error={errors.balance}
                hint={
                  errors.balance ? undefined : t("accounts.add.balanceHint")
                }
                prefixLabel={t("common.currency.code")}
                sanitizeInput={sanitizeAmountInput}
                formatDisplay={(amount) =>
                  formatAmountInput(amount, amountInputLocale)
                }
                triggerClassName="h-14 text-2xl font-semibold tabular-nums tracking-tight"
                validate={(next) => validateAccountBalanceField(next, t)}
                onSave={(nextBalance) => {
                  setBalance(nextBalance);
                  clearFieldError("balance");
                }}
              />
            </div>
          )}

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
            ? isCertificate
              ? t("certificates.create.creating")
              : t("accounts.creating")
            : isCertificate
              ? t("certificates.create.submit")
              : isFirstAccountFlow
                ? t("accounts.add.firstAccount.cta")
                : t("accounts.createAccount")}
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
