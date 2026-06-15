"use client";

import { DateField } from "@/components/ui/date-field";
import { EditableField } from "@/components/field-editor";
import { InterestDestinationPicker } from "@/components/ui/interest-destination-picker";
import { InstitutionPicker } from "@/components/ui/institution-picker";
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
import type { Account } from "@/lib/finance/types";
import {
  formatAmountInput,
  sanitizeAmountInput,
  sanitizeDecimalInput,
} from "@/lib/format/currency";
import {
  validateCertificateCustomTermField,
  validateCertificateNameField,
  validateCertificatePrincipalField,
  validateCertificateRateField,
} from "@/lib/field-editor/field-validators";
import type { TranslationKey } from "@/lib/i18n";
import { useT, useFormatLocale } from "@/providers/i18n-provider";

const PAYOUT_FREQUENCIES: PayoutFrequency[] = [
  "monthly",
  "quarterly",
  "semi_annual",
  "annual",
  "at_maturity",
  "instantly",
];

interface CertificateFormFieldsProps {
  values: CertificateFormValues;
  errors: Record<string, string>;
  amountInputLocale: string;
  settlementAccounts: Account[];
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
  settlementAccounts,
  disabled = false,
  onChange,
  onClearError,
}: CertificateFormFieldsProps) {
  const t = useT();
  const formatLocale = useFormatLocale();

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

  return (
    <div className="space-y-5">
      <EditableField
        id="certificate-name"
        label={t("certificates.fields.name.label")}
        value={values.name}
        placeholder={t("certificates.fields.name.placeholder")}
        disabled={disabled}
        error={errors.name}
        validate={(name) => validateCertificateNameField(name, t)}
        onSave={(name) => {
          onChange({ name });
          onClearError("name");
        }}
      />

      <InstitutionPicker
        id="certificate-institution"
        accountType="certificate"
        value={values.institution}
        disabled={disabled}
        label={t("certificates.fields.institution.label")}
        placeholder={t("certificates.fields.institution.placeholder")}
        customLabel={t("institutions.customName.label")}
        customPlaceholder={t("institutions.customName.placeholder")}
        onChange={(institution) => onChange({ institution })}
      />

      <EditableField
        id="certificate-principal"
        label={t("certificates.fields.principal.label")}
        mode="numeric"
        inputMode="decimal"
        value={values.principalAmount}
        placeholder={t("common.currency.zeroPlaceholder")}
        disabled={disabled}
        error={errors.principalAmount}
        hint={
          errors.principalAmount
            ? undefined
            : t("certificates.fields.principal.hint")
        }
        prefixLabel={t("common.currency.code")}
        sanitizeInput={sanitizeAmountInput}
        formatDisplay={(amount) => formatAmountInput(amount, amountInputLocale)}
        triggerClassName="h-14 text-2xl font-semibold tabular-nums tracking-tight"
        validate={(amount) => validateCertificatePrincipalField(amount, t)}
        onSave={(principalAmount) => {
          onChange({ principalAmount });
          onClearError("principalAmount");
        }}
      />

      <EditableField
        id="certificate-rate"
        label={t("certificates.fields.rate.label")}
        mode="numeric"
        inputMode="decimal"
        value={values.annualInterestRate}
        placeholder="0"
        disabled={disabled}
        error={errors.annualInterestRate}
        hint={
          errors.annualInterestRate
            ? undefined
            : t("certificates.fields.rate.hint")
        }
        suffixLabel="%"
        sanitizeInput={sanitizeAmountInput}
        formatDisplay={(rate) => formatAmountInput(rate, amountInputLocale)}
        validate={(rate) => validateCertificateRateField(rate, t)}
        onSave={(annualInterestRate) => {
          onChange({ annualInterestRate });
          onClearError("annualInterestRate");
        }}
      />

      <div className="space-y-2">
        <Label htmlFor="certificate-purchase-date">
          {t("certificates.fields.purchaseDate.label")}
        </Label>
        <DateField
          id="certificate-purchase-date"
          value={values.purchaseDate}
          disabled={disabled}
          label={t("certificates.fields.purchaseDate.label")}
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
          <EditableField
            id="certificate-custom-term"
            hideLabel
            label={t("certificates.fields.term.custom")}
            mode="numeric"
            inputMode="decimal"
            value={values.customTermYears}
            placeholder={t("certificates.fields.term.custom")}
            disabled={disabled}
            error={errors.term}
            sanitizeInput={(raw) => sanitizeDecimalInput(raw, 1)}
            validate={(term) => validateCertificateCustomTermField(term, t)}
            onSave={(customTermYears) => {
              onChange({ customTermYears });
              onClearError("term");
            }}
          />
        ) : errors.term ? (
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

      <InterestDestinationPicker
        id="certificate-interest-destination"
        value={values.destinationAccountId}
        accounts={settlementAccounts}
        disabled={disabled}
        onChange={(destinationAccountId) => onChange({ destinationAccountId })}
      />
    </div>
  );
}
