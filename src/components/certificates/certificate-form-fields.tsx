"use client";

import { useRef } from "react";

import { DateField } from "@/components/ui/date-field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ScrollChipSelect,
  type ScrollChipOption,
} from "@/components/ui/scroll-chip-select";
import {
  CERTIFICATE_TERM_YEAR_PRESETS,
  type CertificateFormValues,
  type CertificateTermPreset,
} from "@/lib/certificates/form";
import type { PayoutFrequency } from "@/lib/certificates/types";
import {
  formatAmountInput,
  sanitizeAmountInput,
} from "@/lib/format/currency";
import type { TranslationKey } from "@/lib/i18n";
import { useT, useFormatLocale } from "@/providers/i18n-provider";

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
  disabled?: boolean;
  onChange: (patch: Partial<CertificateFormValues>) => void;
  onClearError: (field: string) => void;
}

function termYearLabel(
  years: number,
  t: ReturnType<typeof useT>,
): string {
  if (years === 1) return t("certificates.fields.term.yearOne");
  return t("certificates.fields.term.yearsCount", { count: years });
}

export function CertificateFormFields({
  values,
  errors,
  amountInputLocale,
  disabled = false,
  onChange,
  onClearError,
}: CertificateFormFieldsProps) {
  const t = useT();
  const formatLocale = useFormatLocale();
  const principalInputRef = useRef<HTMLInputElement>(null);
  const rateInputRef = useRef<HTMLInputElement>(null);

  const termOptions: ScrollChipOption<CertificateTermPreset>[] = [
    ...CERTIFICATE_TERM_YEAR_PRESETS.map((years) => ({
      value: years,
      label: termYearLabel(years, t),
    })),
    {
      value: "custom",
      label: t("certificates.fields.term.custom"),
    },
  ];

  const payoutOptions: ScrollChipOption<PayoutFrequency>[] = PAYOUT_FREQUENCIES.map(
    (frequency) => ({
      value: frequency,
      label: t(`certificates.payoutFrequency.${frequency}` as TranslationKey),
    }),
  );

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
          disabled={disabled}
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
          disabled={disabled}
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
            disabled={disabled}
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
            disabled={disabled}
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
          disabled={disabled}
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
        <ScrollChipSelect<CertificateTermPreset>
          value={values.termPreset}
          options={termOptions}
          ariaLabel={t("certificates.fields.term.label")}
          onChange={(termPreset) => {
            onChange({
              termPreset,
              customTermYears: termPreset === "custom" ? values.customTermYears : "",
            });
            onClearError("term");
          }}
        />
        {values.termPreset === "custom" ? (
          <Input
            inputMode="decimal"
            disabled={disabled}
            value={values.customTermYears}
            onChange={(event) => {
              const raw = event.target.value.replace(/[^\d.]/g, "");
              const [whole, fraction = ""] = raw.split(".");
              const sanitized =
                raw.includes(".") ? `${whole}.${fraction.slice(0, 1)}` : whole;
              onChange({ customTermYears: sanitized });
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
        <ScrollChipSelect
          value={values.payoutFrequency}
          options={payoutOptions}
          ariaLabel={t("certificates.fields.payoutFrequency.label")}
          onChange={(payoutFrequency) => onChange({ payoutFrequency })}
        />
      </div>
    </div>
  );
}
