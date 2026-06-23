"use client";

import {
  AccountFormAccountPicker,
  AccountFormDateField,
  AccountFormEditableField,
  AccountFormIdentifierField,
  AccountFormInstitutionPicker,
  AccountFormRenewalTypePicker,
  AccountFormScrollChipSelect,
  AccountFormSection,
  AccountFormSections,
  type ScrollChipOption,
} from "@/components/forms/account-form-section";
import { ToggleSettingRow } from "@/components/patterns";
import {
  CERTIFICATE_TERM_YEAR_PRESETS,
  type CertificateFormValues,
  type CertificateTermPreset,
} from "@/lib/certificates/form";
import type { PayoutFrequency } from "@/lib/certificates/types";
import type { Account } from "@/lib/finance/types";
import { POSTING_DAY_FORM_LAST } from "@/lib/savings/posting-schedule";
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
import { CARD_SURFACE_FLAT_CLASS } from "@/lib/layout/card-surface";
import { cn } from "@/lib/utils";
import { useT, useFormatLocale } from "@/providers/i18n-provider";

const PAYOUT_FREQUENCIES: PayoutFrequency[] = [
  "daily",
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
  transferAccounts: Account[];
  disabled?: boolean;
  renewalEditable?: boolean;
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
  transferAccounts,
  disabled = false,
  renewalEditable = true,
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

  const payoutDayOptions: ScrollChipOption<string>[] = [
    ...Array.from({ length: 28 }, (_, index) => ({
      value: String(index + 1),
      label: String(index + 1),
    })),
    {
      value: POSTING_DAY_FORM_LAST,
      label: t("savings.fields.postingDay.lastOfMonth"),
    },
  ];

  const showsPayoutDay =
    values.payoutFrequency !== "daily" &&
    values.payoutFrequency !== "at_maturity" &&
    values.payoutFrequency !== "instantly";

  return (
    <AccountFormSections
      requirements={{
        accountType: "certificate",
        showsInstitution: true,
        showsIdentifier: true,
        termPreset: values.termPreset,
        payoutFrequency: values.payoutFrequency,
        showsPayoutDay,
        autoApplyInterest: values.autoApplyInterest,
      }}
    >
      <AccountFormSection title={t("accounts.formSections.accountDetails")}>
        <AccountFormEditableField
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

        <AccountFormInstitutionPicker
          id="certificate-institution"
          accountType="certificate"
          value={values.institution}
          disabled={disabled}
          error={errors.institution}
          onChange={(institution) => {
            onChange({ institution });
            onClearError("institution");
          }}
        />

        <AccountFormIdentifierField
          id="certificate-number"
          labelKey="accounts.fields.certificateNumber.label"
          placeholderKey="accounts.fields.certificateNumber.placeholder"
          value={values.certificateNumber}
          disabled={disabled}
          error={errors.certificateNumber}
          onChange={(certificateNumber) => onChange({ certificateNumber })}
          onClearError={() => onClearError("certificateNumber")}
        />

        <AccountFormEditableField
          id="certificate-principal"
          label={t("certificates.fields.principal.label")}
          mode="numeric"
          inputMode="decimal"
          value={values.principalAmount}
          placeholder={t("common.currency.zeroPlaceholder")}
          disabled={disabled}
          error={errors.principalAmount}
          sanitizeInput={sanitizeAmountInput}
          formatDisplay={(amount) => formatAmountInput(amount, amountInputLocale)}
          validate={(amount) => validateCertificatePrincipalField(amount, t)}
          onSave={(principalAmount) => {
            onChange({ principalAmount });
            onClearError("principalAmount");
          }}
        />

        <AccountFormDateField
          id="certificate-purchase-date"
          label={t("certificates.fields.purchaseDate.label")}
          value={values.purchaseDate}
          disabled={disabled}
          error={errors.purchaseDate}
          placeholder={t("certificates.fields.purchaseDate.placeholder")}
          onChange={(value) => {
            onChange({ purchaseDate: value });
            onClearError("purchaseDate");
          }}
          locale={formatLocale}
        />
      </AccountFormSection>

      <AccountFormSection title={t("accounts.formSections.interestDetails")}>
        <AccountFormEditableField
          id="certificate-rate"
          label={t("accounts.fields.annualRate.label")}
          mode="numeric"
          inputMode="decimal"
          value={values.annualInterestRate}
          placeholder="0"
          disabled={disabled}
          error={errors.annualInterestRate}
          suffixLabel="%"
          sanitizeInput={sanitizeAmountInput}
          formatDisplay={(rate) => formatAmountInput(rate, amountInputLocale)}
          validate={(rate) => validateCertificateRateField(rate, t)}
          onSave={(annualInterestRate) => {
            onChange({ annualInterestRate });
            onClearError("annualInterestRate");
          }}
        />

        <AccountFormScrollChipSelect<CertificateTermPreset>
          label={t("certificates.fields.term.label")}
          fieldId="certificate-term"
          value={values.termPreset}
          options={termOptions}
          ariaLabel={t("certificates.fields.term.label")}
          error={values.termPreset !== "custom" ? errors.term : undefined}
          onChange={(termPreset) => {
            onChange({
              termPreset,
              customTermYears: termPreset === "custom" ? values.customTermYears : "",
            });
            onClearError("term");
          }}
        />

        {values.termPreset === "custom" ? (
          <AccountFormEditableField
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
        ) : null}

        <AccountFormScrollChipSelect
          label={t("certificates.fields.payoutFrequency.label")}
          value={values.payoutFrequency}
          options={payoutOptions}
          ariaLabel={t("certificates.fields.payoutFrequency.label")}
          onChange={(payoutFrequency) => onChange({ payoutFrequency })}
        />

        {showsPayoutDay ? (
          <AccountFormScrollChipSelect
            label={t("savings.fields.postingDay.label")}
            fieldId="certificate-payout-day"
            value={values.payoutDay}
            options={payoutDayOptions}
            ariaLabel={t("savings.fields.postingDay.label")}
            error={errors.payoutDay}
            onChange={(payoutDay) => {
              onChange({ payoutDay });
              onClearError("payoutDay");
            }}
          />
        ) : null}

        {values.payoutFrequency === "daily" ? (
          <div className={cn(CARD_SURFACE_FLAT_CLASS, "px-4")}>
            <p className="border-b border-border py-3 text-sm font-medium">
              {t("businessDays.title")}
            </p>
            <ToggleSettingRow
              label={t("businessDays.excludeWeekends.label")}
              description={t("businessDays.excludeWeekends.description")}
              checked={values.excludeWeekends}
              disabled={disabled}
              onCheckedChange={(excludeWeekends) => onChange({ excludeWeekends })}
            />
            <ToggleSettingRow
              label={t("businessDays.excludeEgyptianHolidays.label")}
              description={t(
                "businessDays.excludeEgyptianHolidays.description",
              )}
              checked={values.excludeEgyptianHolidays}
              disabled={disabled}
              onCheckedChange={(excludeEgyptianHolidays) =>
                onChange({ excludeEgyptianHolidays })
              }
            />
          </div>
        ) : null}
      </AccountFormSection>

      <AccountFormSection title={t("accounts.formSections.recurring")}>
        <div className={cn(CARD_SURFACE_FLAT_CLASS, "px-4")}>
          <ToggleSettingRow
            label={t("certificates.fields.autoApplyInterest.label")}
            description={t("certificates.fields.autoApplyInterest.description")}
            checked={values.autoApplyInterest}
            disabled={disabled}
            onCheckedChange={(autoApplyInterest) => {
              onChange({
                autoApplyInterest,
                destinationAccountId: autoApplyInterest
                  ? values.destinationAccountId
                  : null,
              });
              onClearError("destinationAccountId");
            }}
          />
        </div>

        <AccountFormAccountPicker
          id="certificate-interest-destination"
          label={t("accounts.fields.interestDestinationAccount.label")}
          description={t(
            "accounts.fields.interestDestinationAccount.description",
          )}
          placeholder={t(
            "accounts.fields.interestDestinationAccount.placeholder",
          )}
          searchPlaceholder={t(
            "accounts.fields.interestDestinationAccount.searchPlaceholder",
          )}
          noResultsMessage={t(
            "accounts.fields.interestDestinationAccount.noResults",
          )}
          value={values.destinationAccountId}
          accounts={transferAccounts}
          disabled={disabled || !values.autoApplyInterest}
          allowClear
          error={errors.destinationAccountId}
          onChange={(destinationAccountId) => {
            onChange({ destinationAccountId });
            onClearError("destinationAccountId");
          }}
        />

        <AccountFormRenewalTypePicker
          id="certificate-renewal-type"
          label={t("certificates.fields.renewal.type.label")}
          value={values.renewalType}
          disabled={disabled}
          readOnly={!renewalEditable}
          onChange={(renewalType) => {
            onChange({ renewalType });
            onClearError("renewalType");
          }}
        />
      </AccountFormSection>
    </AccountFormSections>
  );
}
