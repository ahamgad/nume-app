"use client";

import { AccountIdentifierField } from "@/components/accounts/account-identifier-field";
import { AccountFormSection, AccountFormSections } from "@/components/forms/account-form-section";
import { EditableField } from "@/components/field-editor";
import { InstitutionPicker } from "@/components/ui/institution-picker";
import type { InstitutionPickerContext } from "@/lib/institutions/catalog";
import {
  validateAccountBalanceField,
  validateAccountNameField,
} from "@/lib/field-editor/field-validators";
import { formatBalanceTriggerDisplay } from "@/lib/field-editor/balance-sign";
import {
  formatAmountInput,
  sanitizeAmountInput,
} from "@/lib/format/currency";
import type { MoneyAccountType } from "@/lib/finance/types";
import { shouldShowInstitutionPicker } from "@/lib/institutions/catalog";
import { showsBalanceField, showsInstitutionField } from "@/lib/finance/account-form";
import { useT } from "@/providers/i18n-provider";

export { showsBalanceField, showsInstitutionField } from "@/lib/finance/account-form";

export interface MoneyAccountFormValues {
  name: string;
  institution: string;
  accountNumber: string;
  balance: string;
}

interface MoneyAccountFormFieldsProps {
  accountType: MoneyAccountType;
  values: MoneyAccountFormValues;
  errors: Record<string, string>;
  amountInputLocale: string;
  disabled?: boolean;
  mode?: "create" | "edit";
  onChange: (patch: Partial<MoneyAccountFormValues>) => void;
  onClearError: (field: string) => void;
}

export function MoneyAccountFormFields({
  accountType,
  values,
  errors,
  amountInputLocale,
  disabled = false,
  mode = "create",
  onChange,
  onClearError,
}: MoneyAccountFormFieldsProps) {
  const t = useT();
  const showInstitution = showsInstitutionField(accountType);
  const showBalance = showsBalanceField(accountType, mode);

  return (
    <AccountFormSections>
      <AccountFormSection title={t("accounts.formSections.accountDetails")}>
      <EditableField
        id="account-name"
        label={t("accounts.fields.name.label")}
        value={values.name}
        placeholder={t("accounts.fields.name.placeholder")}
        disabled={disabled}
        error={errors.name}
        variant="row"
        validate={(next) => validateAccountNameField(next, t)}
        onSave={(name) => {
          onChange({ name });
          onClearError("name");
        }}
      />

      {showInstitution ? (
        shouldShowInstitutionPicker(accountType as InstitutionPickerContext) ? (
          <InstitutionPicker
            key={accountType}
            id="account-institution"
            accountType={accountType as InstitutionPickerContext}
            value={values.institution}
            disabled={disabled}
            error={errors.institution}
            variant="row"
            onChange={(institution) => {
              onChange({ institution });
              onClearError("institution");
            }}
          />
        ) : (
          <EditableField
            id="account-institution"
            label={t("accounts.fields.institution.label")}
            value={values.institution}
            placeholder={t("accounts.fields.institution.placeholder")}
            disabled={disabled}
            error={errors.institution}
            variant="row"
            onSave={(institution) => {
              onChange({ institution });
              onClearError("institution");
            }}
          />
        )
      ) : null}

      {accountType === "current_account" ? (
        <AccountIdentifierField
          id="account-number-last4"
          labelKey="accounts.fields.accountNumber.label"
          placeholderKey="accounts.fields.accountNumber.placeholder"
          value={values.accountNumber}
          disabled={disabled}
          error={errors.accountNumber}
          variant="row"
          onChange={(accountNumber) => onChange({ accountNumber })}
          onClearError={() => onClearError("accountNumber")}
        />
      ) : null}

      {showBalance ? (
        <EditableField
          id="balance"
          label={t("accounts.fields.balance.label")}
          mode="numeric"
          inputMode="decimal"
          value={values.balance}
          placeholder={t("common.currency.zeroPlaceholder")}
          disabled={disabled}
          error={errors.balance}
          variant="row"
          showSignToggle
          sanitizeInput={sanitizeAmountInput}
          formatDisplay={(amount) =>
            formatAmountInput(amount, amountInputLocale)
          }
          displayValue={
            values.balance.trim()
              ? formatBalanceTriggerDisplay(values.balance, (unsigned) =>
                  formatAmountInput(unsigned, amountInputLocale),
                )
              : undefined
          }
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
