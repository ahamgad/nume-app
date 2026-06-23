"use client";

import { AccountIdentifierField } from "@/components/accounts/account-identifier-field";
import { AccountFormSection, AccountFormSections } from "@/components/forms/account-form-section";
import { EditableField } from "@/components/field-editor";
import { InstitutionPicker } from "@/components/ui/institution-picker";
import {
  applyDuplicateAccountIdentityError,
  type AccountIdentityInput,
  type AccountIdentityResolverContext,
} from "@/lib/finance/account-identity-validation";
import { parseOptionalIdentifierLast4 } from "@/lib/finance/account-identifier";
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
    <AccountFormSections>
      <AccountFormSection title={t("accounts.formSections.accountDetails")}>
      <EditableField
        id="lending-name"
        label={t("accounts.fields.name.label")}
        value={values.name}
        placeholder={t("accounts.fields.name.placeholder")}
        disabled={disabled}
        error={errors.name}
        variant="row"
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
        error={errors.institution}
        variant="row"
        onChange={(institution) => {
          onChange({ institution });
          onClearError("institution");
        }}
      />

      <AccountIdentifierField
        id="lending-identifier"
        labelKey="accounts.fields.loanNumber.label"
        placeholderKey="accounts.fields.loanNumber.placeholder"
        value={values.identifier}
        disabled={disabled}
        error={errors.identifier}
        variant="row"
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
          variant="row"
          sanitizeInput={sanitizeAmountInput}
          formatDisplay={(amount) => formatAmountInput(amount, amountInputLocale)}
          validate={(next) => validateAccountBalanceField(next, t)}
          onSave={(balance) => {
            onChange({ balance });
            onClearError("balance");
          }}
        />
      ) : null}
      </AccountFormSection>
    </AccountFormSections>
  );
}

export function validateLendingAccountForm(
  values: LendingAccountFormValues,
  t: ReturnType<typeof useT>,
  mode: "create" | "edit" = "create",
  options?: {
    identityContext?: AccountIdentityResolverContext;
    excludeAccountId?: string;
  },
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

  if (options?.identityContext) {
    const identity: AccountIdentityInput = {
      name: values.name,
      institution: values.institution.trim() || null,
      numberLast4: parseOptionalIdentifierLast4(values.identifier),
    };
    return applyDuplicateAccountIdentityError(
      errors,
      identity,
      options.identityContext,
      options.excludeAccountId,
      t("accounts.validation.duplicateAccount"),
    );
  }

  return errors;
}
