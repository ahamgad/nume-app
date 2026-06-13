"use client";

import { useRef } from "react";

import { DateField } from "@/components/ui/date-field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CERTIFICATE_TERM_PRESETS,
  type CertificateFormValues,
} from "@/lib/certificates/form";
import type { PayoutFrequency } from "@/lib/certificates/types";
import {
  formatAmountInput,
  sanitizeAmountInput,
} from "@/lib/format/currency";
import type { TranslationKey } from "@/lib/i18n";
import { useT, useFormatLocale } from "@/providers/i18n-provider";
import { cn } from "@/lib/utils";

const PAYOUT_FREQUENCIES: PayoutFrequency[] = [
  "monthly",
  "quarterly",
  "semi_annual",
  "annual",
  "at_maturity",
];

interface CertificateFormFieldsProps {
  values: CertificateFormValues;
  errors: Record<string, string>;
  amountInputLocale: string;
  onChange: (patch: Partial<CertificateFormValues>) => void;
  onClearError: (field: string) => void;
}

export function CertificateFormFields({
  values,
  errors,
  amountInputLocale,
  onChange,
  onClearError,
}: CertificateFormFieldsProps) {
  const t = useT();
  const formatLocale = useFormatLocale();
  const principalInputRef = useRef<HTMLInputElement>(null);
  const rateInputRef = useRef<HTMLInputElement>(null);

  function handleAmountChange(
    field: "principalAmount" | "annualInterestRate",
    raw: string,
    inputRef: React.RefObject<HTMLInputElement | null>,
  ) {
    const sanitized = sanitizeAmountInput(raw);
    onChange({ [field]: sanitized });
    onClearError(field);
    requestAnimationFrame(() => {
      const input = inputRef.current;
      if (!input) return;
      const displayLength = formatAmountInput(sanitized, amountInputLocale).length;
      input.setSelectionRange(displayLength, displayLength);
    });
  }

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="certificate-name">{t("certificates.fields.name.label")}</Label>
        <Input
          id="certificate-name"
          value={values.name}
          onChange={(event) => {
            onChange({ name: event.target.value });
            onClearError("name");
          }}
          placeholder={t("certificates.fields.name.placeholder")}
          aria-invalid={Boolean(errors.name)}
          autoComplete="off"
        />
        {errors.name ? (
          <p className="text-sm text-destructive">{errors.name}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="certificate-institution">
          {t("certificates.fields.institution.label")}
        </Label>
        <Input
          id="certificate-institution"
          value={values.institution}
          onChange={(event) => onChange({ institution: event.target.value })}
          placeholder={t("certificates.fields.institution.placeholder")}
          autoComplete="organization"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="certificate-principal">
          {t("certificates.fields.principal.label")}
        </Label>
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-4 text-base font-medium text-muted-foreground">
            {t("common.currency.code")}
          </span>
          <Input
            ref={principalInputRef}
            id="certificate-principal"
            inputMode="decimal"
            value={formatAmountInput(values.principalAmount, amountInputLocale)}
            onChange={(event) =>
              handleAmountChange(
                "principalAmount",
                event.target.value,
                principalInputRef,
              )
            }
            placeholder={t("common.currency.zeroPlaceholder")}
            className="h-14 ps-16 text-2xl font-semibold tabular-nums tracking-tight"
            aria-invalid={Boolean(errors.principalAmount)}
          />
        </div>
        {errors.principalAmount ? (
          <p className="text-sm text-destructive">{errors.principalAmount}</p>
        ) : (
          <p className="text-[0.8125rem] text-muted-foreground">
            {t("certificates.fields.principal.hint")}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="certificate-rate">{t("certificates.fields.rate.label")}</Label>
        <div className="relative">
          <Input
            ref={rateInputRef}
            id="certificate-rate"
            inputMode="decimal"
            value={formatAmountInput(values.annualInterestRate, amountInputLocale)}
            onChange={(event) =>
              handleAmountChange(
                "annualInterestRate",
                event.target.value,
                rateInputRef,
              )
            }
            placeholder="0"
            className="pe-10 tabular-nums"
            aria-invalid={Boolean(errors.annualInterestRate)}
          />
          <span className="pointer-events-none absolute inset-y-0 end-0 flex items-center pe-4 text-sm text-muted-foreground">
            %
          </span>
        </div>
        {errors.annualInterestRate ? (
          <p className="text-sm text-destructive">{errors.annualInterestRate}</p>
        ) : (
          <p className="text-[0.8125rem] text-muted-foreground">
            {t("certificates.fields.rate.hint")}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="certificate-purchase-date">
          {t("certificates.fields.purchaseDate.label")}
        </Label>
        <DateField
          id="certificate-purchase-date"
          value={values.purchaseDate}
          onChange={(value) => {
            onChange({ purchaseDate: value });
            onClearError("purchaseDate");
          }}
          locale={formatLocale}
          aria-invalid={Boolean(errors.purchaseDate)}
        />
        {errors.purchaseDate ? (
          <p className="text-sm text-destructive">{errors.purchaseDate}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label>{t("certificates.fields.term.label")}</Label>
        <div className="grid grid-cols-3 gap-2">
          {CERTIFICATE_TERM_PRESETS.map((months) => (
            <button
              key={months}
              type="button"
              onClick={() => {
                onChange({ termPreset: months, customTermMonths: "" });
                onClearError("term");
              }}
              className={cn(
                "inline-flex min-h-11 items-center justify-center rounded-md border px-2 py-2 text-xs font-medium transition-colors",
                values.termPreset === months
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-background text-foreground",
              )}
            >
              {t("certificates.fields.term.months", { count: months })}
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              onChange({ termPreset: "custom" });
              onClearError("term");
            }}
            className={cn(
              "col-span-3 inline-flex min-h-11 items-center justify-center rounded-md border px-2 py-2 text-xs font-medium transition-colors",
              values.termPreset === "custom"
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-background text-foreground",
            )}
          >
            {t("certificates.fields.term.custom")}
          </button>
        </div>
        {values.termPreset === "custom" ? (
          <Input
            inputMode="numeric"
            value={values.customTermMonths}
            onChange={(event) => {
              onChange({ customTermMonths: event.target.value.replace(/\D/g, "") });
              onClearError("term");
            }}
            placeholder={t("certificates.fields.term.custom")}
            aria-invalid={Boolean(errors.term)}
          />
        ) : null}
        {errors.term ? (
          <p className="text-sm text-destructive">{errors.term}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label>{t("certificates.fields.payoutFrequency.label")}</Label>
        <div className="flex flex-wrap gap-2">
          {PAYOUT_FREQUENCIES.map((frequency) => (
            <button
              key={frequency}
              type="button"
              onClick={() => onChange({ payoutFrequency: frequency })}
              className={cn(
                "inline-flex min-h-11 flex-1 basis-[calc(50%-0.25rem)] items-center justify-center rounded-md border px-2 py-2 text-xs font-medium transition-colors",
                values.payoutFrequency === frequency
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-background text-foreground",
              )}
            >
              {t(`certificates.payoutFrequency.${frequency}` as TranslationKey)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
