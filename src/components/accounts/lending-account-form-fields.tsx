"use client";

import { AccountIdentifierField } from "@/components/accounts/account-identifier-field";
import { FormSection } from "@/components/forms/form-section";
import { EditableField } from "@/components/field-editor";
import { InstitutionPicker } from "@/components/ui/institution-picker";
import {
  validateAccountBalanceField,
  validateAccountNameField,
  validateIdentifierLast4Field,
} from "@/lib/field-editor/field-validators";
import {
  formatAmountInput,
  sanitizeAmountInput,
} from "@/lib/format/currency";
import { useT } from "@/providers/i18n-provider";

export interface LendingAccountFormValues {
  name: string;
  institution: string;
  identifier: string;
  balance: string;
}

interface LendingAccountFormFieldsProps {
  values: LendingAccountFormValues;
  errors: Record<string, string>;
  amountInputLocale: string;
  disabled?: boolean;
  mode?: "create" | "edit";
  onChange: (patch: Partial<LendingAccountFormValues>) => void;
  onClearError: (field: string) => void;
}

export function LendingAccountFormFields({
  values,
  errors,
  amountInputLocale,
  disabled = false,
  mode = "create",
  onChange,
  onClearError,
}: LendingAccountFormFieldsProps) {
  const t = useT();

  return (
    <FormSection title={t("accounts.formSections.accountDetails")}>
      <EditableField
        id="lending-name"
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
        id="lending-institution"
        accountType="loan"
        value={values.institution}
        disabled={disabled}
        onChange={(institution) => onChange({ institution })}
      />

      <AccountIdentifierField
        id="lending-identifier"
        labelKey="accounts.fields.loanNumber.label"
        placeholderKey="accounts.fields.loanNumber.placeholder"
        value={values.identifier}
        disabled={disabled}
        error={errors.identifier}
        onChange={(identifier) => onChange({ identifier })}
        onClearError={() => onClearError("identifier")}
      />

      {mode === "create" ? (
        <EditableField
          id="lending-balance"
          label={t("accounts.fields.balance.label")}
          mode="numeric"
          inputMode="decimal"
          value={values.balance}
          placeholder={t("common.currency.zeroPlaceholder")}
          disabled={disabled}
          error={errors.balance}
          hint={errors.balance ? undefined : t("accounts.add.balanceHint")}
          prefixLabel={t("common.currency.code")}
          sanitizeInput={sanitizeAmountInput}
          formatDisplay={(amount) => formatAmountInput(amount, amountInputLocale)}
          triggerClassName="h-14 text-2xl font-semibold tabular-nums tracking-tight"
          validate={(next) => validateAccountBalanceField(next, t)}
          onSave={(balance) => {
            onChange({ balance });
            onClearError("balance");
          }}
        />
      ) : null}
    </FormSection>
  );
}

export function validateLendingAccountForm(
  values: LendingAccountFormValues,
  t: ReturnType<typeof useT>,
  mode: "create" | "edit" = "create",
): Record<string, string> {
  const errors: Record<string, string> = {};
  const nameError = validateAccountNameField(values.name, t);
  if (nameError) errors.name = nameError;

  if (!values.institution.trim()) {
    errors.institution = t("accounts.validation.institutionRequired");
  }

  const identifierError = validateIdentifierLast4Field(values.identifier, t);
  if (identifierError) errors.identifier = identifierError;

  if (mode === "create") {
    const balanceError = validateAccountBalanceField(values.balance, t);
    if (balanceError) errors.balance = balanceError;
  }

  return errors;
}
