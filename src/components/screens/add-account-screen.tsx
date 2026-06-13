"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { CertificateFormFields } from "@/components/certificates/certificate-form-fields";
import { ScreenBody, ScreenHeader } from "@/components/layout/screen-header";
import { StickyFooter } from "@/components/patterns";
import { Button } from "@/components/ui/button";
import { DiscardDialog } from "@/components/ui/discard-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DEFAULT_CERTIFICATE_FORM_VALUES,
  resolveTermMonths,
  validateCertificateForm,
  type CertificateFormValues,
} from "@/lib/certificates/form";
import { ADD_ACCOUNT_TYPES, isCertificateAccountType } from "@/lib/finance/add-account-types";
import { getAccountTypeLabelKey } from "@/lib/finance/account-labels";
import {
  ENABLED_ADD_ACCOUNT_TYPES,
  type AccountType,
  type MoneyAccountType,
} from "@/lib/finance/types";
import {
  formatAmountInput,
  parseAmount,
  sanitizeAmountInput,
} from "@/lib/format/currency";
import { useFinance } from "@/lib/finance/store";
import { getSupabaseErrorMessage, logSupabaseError } from "@/lib/supabase/errors";
import { getAmountInputLocale } from "@/lib/i18n/locale";
import { useT, useLocale } from "@/providers/i18n-provider";
import { useToast } from "@/providers/toast-provider";
import { cn } from "@/lib/utils";

export function AddAccountScreen() {
  const t = useT();
  const locale = useLocale();
  const amountInputLocale = getAmountInputLocale(locale);
  const router = useRouter();
  const { accounts, createAccount, createCertificate } = useFinance();
  const { showToast } = useToast();
  const nameInputRef = useRef<HTMLInputElement>(null);
  const balanceInputRef = useRef<HTMLInputElement>(null);

  const isFirstAccount = accounts.length === 0;

  const [accountType, setAccountType] = useState<AccountType>("current_account");
  const [name, setName] = useState("");
  const [balance, setBalance] = useState("");
  const [certificateValues, setCertificateValues] = useState<CertificateFormValues>(
    DEFAULT_CERTIFICATE_FORM_VALUES,
  );
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showDiscard, setShowDiscard] = useState(false);

  const isCertificate = isCertificateAccountType(accountType);

  const isDirty = isCertificate
    ? certificateValues.name.trim().length > 0 ||
      certificateValues.institution.trim().length > 0 ||
      certificateValues.principalAmount.trim().length > 0 ||
      certificateValues.annualInterestRate.trim().length > 0 ||
      certificateValues.customTermMonths.trim().length > 0
    : name.trim().length > 0 || balance.trim().length > 0;

  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  function clearFieldError(field: string) {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  function handleBalanceChange(e: React.ChangeEvent<HTMLInputElement>) {
    const sanitized = sanitizeAmountInput(e.target.value);
    setBalance(sanitized);
    clearFieldError("balance");
    requestAnimationFrame(() => {
      const input = balanceInputRef.current;
      if (!input) return;
      const displayLength = formatAmountInput(sanitized, amountInputLocale).length;
      input.setSelectionRange(displayLength, displayLength);
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
        });
        showToast(t("certificates.create.success"));
        router.replace(`/accounts/${certificate.accountId}`);
      } catch (error) {
        logSupabaseError("createCertificate", error);
        setErrors({
          form: getSupabaseErrorMessage(error) || t("common.retry"),
        });
      } finally {
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
        currentBalance: parsedBalance,
      });
      showToast(t("common.accountCreated"));
      router.replace(`/accounts/${account.id}`);
    } catch (error) {
      logSupabaseError("createAccount", error);
      setErrors({
        form: getSupabaseErrorMessage(error) || t("common.retry"),
      });
    } finally {
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

  const selectableTypes = isFirstAccount ? ENABLED_ADD_ACCOUNT_TYPES : ADD_ACCOUNT_TYPES;

  return (
    <>
      <ScreenHeader
        mode="stack"
        title={
          isCertificate
            ? t("certificates.create.title")
            : isFirstAccount
              ? t("accounts.add.firstAccount.title")
              : t("accounts.add.title")
        }
        onBack={handleBack}
      />
      <ScreenBody withTabBar={false} withStickyFooter>
        <div className="space-y-6 pt-2">
          <p className="text-[0.9375rem] leading-relaxed text-muted-foreground">
            {isCertificate
              ? t("accounts.add.certificateLead")
              : isFirstAccount
                ? t("accounts.add.firstAccount.lead")
                : t("accounts.add.lead")}
          </p>

          {!isFirstAccount || !isCertificate ? (
            <div className="space-y-2">
              <Label>{t("accounts.add.chooseType")}</Label>
              <div className={cn("grid gap-2", isFirstAccount ? "grid-cols-3" : "grid-cols-2")}>
                {selectableTypes.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      setAccountType(type);
                      setErrors({});
                    }}
                    className={cn(
                      "inline-flex min-h-11 items-center justify-center rounded-md border px-2 py-2 text-xs font-medium transition-colors",
                      accountType === type
                        ? "border-foreground bg-foreground text-background"
                        : "border-border bg-background text-foreground",
                    )}
                  >
                    {t(getAccountTypeLabelKey(type))}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {isCertificate ? (
            <CertificateFormFields
              values={certificateValues}
              errors={errors}
              amountInputLocale={amountInputLocale}
              onChange={(patch) =>
                setCertificateValues((current) => ({ ...current, ...patch }))
              }
              onClearError={clearFieldError}
            />
          ) : (
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="account-name">
                  {t("accounts.fields.name.label")}
                </Label>
                <Input
                  ref={nameInputRef}
                  id="account-name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    clearFieldError("name");
                  }}
                  placeholder={t("accounts.fields.name.placeholder")}
                  aria-invalid={Boolean(errors.name)}
                  autoComplete="off"
                />
                {errors.name ? (
                  <p className="text-sm text-destructive">{errors.name}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="balance">
                  {t("accounts.fields.balance.label")}
                </Label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-4 text-base font-medium text-muted-foreground">
                    {t("common.currency.code")}
                  </span>
                  <Input
                    ref={balanceInputRef}
                    id="balance"
                    inputMode="decimal"
                    value={formatAmountInput(balance, amountInputLocale)}
                    onChange={handleBalanceChange}
                    placeholder={t("common.currency.zeroPlaceholder")}
                    className="h-14 ps-16 text-2xl font-semibold tabular-nums tracking-tight"
                    aria-invalid={Boolean(errors.balance)}
                  />
                </div>
                {errors.balance ? (
                  <p className="text-sm text-destructive">{errors.balance}</p>
                ) : (
                  <p className="text-[0.8125rem] text-muted-foreground">
                    {t("accounts.add.balanceHint")}
                  </p>
                )}
              </div>
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
              : isFirstAccount
                ? t("accounts.add.firstAccount.cta")
                : t("accounts.createAccount")}
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
