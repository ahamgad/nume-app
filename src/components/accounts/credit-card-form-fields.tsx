"use client";

import { AccountIdentifierField } from "@/components/accounts/account-identifier-field";
import { FormSection } from "@/components/forms/form-section";
import { EditableField } from "@/components/field-editor";
import { ToggleSettingRow } from "@/components/patterns";
import { PaymentSourcePicker } from "@/components/ui/payment-source-picker";
import { InstitutionPicker } from "@/components/ui/institution-picker";
import { Label } from "@/components/ui/label";
import {
  ScrollChipSelect,
  type ScrollChipOption,
} from "@/components/ui/scroll-chip-select";
import type { CreditCardFormValues } from "@/lib/credit-cards/form";
import {
  formatAmountInput,
  sanitizeAmountInput,
  sanitizeDecimalInput,
} from "@/lib/format/currency";
import {
  validateAccountBalanceField,
  validateAccountNameField,
} from "@/lib/field-editor/field-validators";
import type { Account } from "@/lib/finance/types";
import { useT } from "@/providers/i18n-provider";

const STATEMENT_DAYS = Array.from({ length: 28 }, (_, index) => index + 1);

interface CreditCardFormFieldsProps {
  values: CreditCardFormValues;
  errors: Record<string, string>;
  amountInputLocale: string;
  paymentSourceAccounts: Account[];
  disabled?: boolean;
  mode?: "create" | "edit";
  onChange: (patch: Partial<CreditCardFormValues>) => void;
  onClearError: (field: string) => void;
}

export function CreditCardFormFields({
  values,
  errors,
  amountInputLocale,
  paymentSourceAccounts,
  disabled = false,
  mode = "create",
  onChange,
  onClearError,
}: CreditCardFormFieldsProps) {
  const t = useT();

  const dayOptions: ScrollChipOption<string>[] = STATEMENT_DAYS.map((day) => ({
    value: String(day),
    label: String(day),
  }));

  return (
    <>
      <FormSection title={t("accounts.formSections.accountDetails")}>
        <EditableField
          id="credit-card-name"
          label={t("accounts.fields.name.label")}
          value={values.name}
          placeholder={t("accounts.fields.name.placeholder")}
          disabled={disabled}
          error={errors.name}
          validate={(name) => validateAccountNameField(name, t)}
          onSave={(name) => {
            onChange({ name });
            onClearError("name");
          }}
        />

        <InstitutionPicker
          id="credit-card-institution"
          accountType="credit_card"
          value={values.institution}
          disabled={disabled}
          onChange={(institution) => {
            onChange({ institution });
            onClearError("institution");
          }}
        />
        {errors.institution ? (
          <p className="text-sm text-destructive">{errors.institution}</p>
        ) : null}

        <AccountIdentifierField
          id="credit-card-identifier"
          labelKey="accounts.fields.cardNumber.label"
          placeholderKey="accounts.fields.cardNumber.placeholder"
          value={values.identifier}
          disabled={disabled}
          error={errors.identifier}
          onChange={(identifier) => onChange({ identifier })}
          onClearError={() => onClearError("identifier")}
        />

        {mode === "create" ? (
          <EditableField
            id="credit-card-outstanding"
            label={t("creditCards.fields.outstandingBalance.label")}
            mode="numeric"
            inputMode="decimal"
            value={values.outstandingBalance}
            placeholder={t("common.currency.zeroPlaceholder")}
            disabled={disabled}
            error={errors.outstandingBalance}
            hint={
              errors.outstandingBalance
                ? undefined
                : t("creditCards.fields.outstandingBalance.hint")
            }
            prefixLabel={t("common.currency.code")}
            sanitizeInput={sanitizeAmountInput}
            formatDisplay={(amount) => formatAmountInput(amount, amountInputLocale)}
            triggerClassName="h-14 text-2xl font-semibold tabular-nums tracking-tight"
            validate={(next) => validateAccountBalanceField(next, t)}
            onSave={(outstandingBalance) => {
              onChange({ outstandingBalance });
              onClearError("outstandingBalance");
            }}
          />
        ) : null}

        <EditableField
          id="credit-card-limit"
          label={t("creditCards.fields.creditLimit.label")}
          mode="numeric"
          inputMode="decimal"
          value={values.creditLimit}
          placeholder={t("creditCards.fields.creditLimit.placeholder")}
          disabled={disabled}
          error={errors.creditLimit}
          hint={t("creditCards.fields.creditLimit.hint")}
          prefixLabel={t("common.currency.code")}
          sanitizeInput={sanitizeDecimalInput}
          formatDisplay={(amount) => formatAmountInput(amount, amountInputLocale)}
          onSave={(creditLimit) => {
            onChange({ creditLimit });
            onClearError("creditLimit");
          }}
        />
      </FormSection>

      <FormSection title={t("creditCards.formSections.statementCycle")}>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{t("creditCards.fields.statementCloseDay.label")}</Label>
            <ScrollChipSelect
              value={values.statementCloseDay}
              options={dayOptions}
              ariaLabel={t("creditCards.fields.statementCloseDay.label")}
              onChange={(statementCloseDay) => {
                onChange({ statementCloseDay });
                onClearError("statementCloseDay");
              }}
            />
            {errors.statementCloseDay ? (
              <p className="text-sm text-destructive">{errors.statementCloseDay}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label>{t("creditCards.fields.paymentDueDay.label")}</Label>
            <ScrollChipSelect
              value={values.paymentDueDay}
              options={dayOptions}
              ariaLabel={t("creditCards.fields.paymentDueDay.label")}
              onChange={(paymentDueDay) => {
                onChange({ paymentDueDay });
                onClearError("paymentDueDay");
              }}
            />
            {errors.paymentDueDay ? (
              <p className="text-sm text-destructive">{errors.paymentDueDay}</p>
            ) : null}
          </div>
        </div>
      </FormSection>

      <FormSection title={t("creditCards.formSections.paymentSource")}>
        <PaymentSourcePicker
          id="credit-card-payment-source"
          value={values.paymentSourceAccountId}
          accounts={paymentSourceAccounts}
          disabled={disabled}
          onChange={(paymentSourceAccountId) => {
            onChange({ paymentSourceAccountId });
            onClearError("paymentSourceAccountId");
          }}
        />
        <p className="text-sm text-muted-foreground">
          {t("creditCards.fields.paymentSource.hint")}
        </p>
      </FormSection>

      <FormSection title={t("accounts.fields.settings.title")}>
        <ToggleSettingRow
          label={t("accounts.settings.includeInNetWorth.label")}
          description={t("accounts.settings.includeInNetWorth.description")}
          checked={values.includeInNetWorth}
          disabled={disabled}
          onCheckedChange={(includeInNetWorth) => onChange({ includeInNetWorth })}
        />
        <ToggleSettingRow
          label={t("accounts.settings.includeInEmergencyFund.label")}
          description={t("accounts.settings.includeInEmergencyFund.description")}
          checked={values.includeInEmergencyFund}
          disabled={disabled}
          onCheckedChange={(includeInEmergencyFund) =>
            onChange({ includeInEmergencyFund })
          }
        />
      </FormSection>
    </>
  );
}
