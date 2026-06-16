"use client";

import { FormSection } from "@/components/forms/form-section";
import { EditableField } from "@/components/field-editor";
import { InstitutionPicker } from "@/components/ui/institution-picker";
import type { InstitutionPickerContext } from "@/lib/institutions/catalog";
import {
  validateAccountBalanceField,
  validateAccountNameField,
} from "@/lib/field-editor/field-validators";
import {
  formatAmountInput,
  sanitizeAmountInput,
} from "@/lib/format/currency";
import type { MoneyAccountType } from "@/lib/finance/types";
import { shouldShowInstitutionPicker } from "@/lib/institutions/catalog";
import { useT } from "@/providers/i18n-provider";

export interface MoneyAccountFormValues {
  name: string;
  institution: string;
  balance: string;
}

interface MoneyAccountFormFieldsProps {
  accountType: MoneyAccountType;
  values: MoneyAccountFormValues;
  errors: Record<string, string>;
  amountInputLocale: string;
  disabled?: boolean;
  onChange: (patch: Partial<MoneyAccountFormValues>) => void;
  onClearError: (field: string) => void;
}

export function showsBalanceField(accountType: MoneyAccountType): boolean {
  return accountType !== "cash";
}

export function MoneyAccountFormFields({
  accountType,
  values,
  errors,
  amountInputLocale,
  disabled = false,
  onChange,
  onClearError,
}: MoneyAccountFormFieldsProps) {
  const t = useT();
  const showInstitutionPicker = shouldShowInstitutionPicker(
    accountType as InstitutionPickerContext,
  );
  const showBalance = showsBalanceField(accountType);

  return (
    <FormSection title={t("accounts.formSections.accountDetails")}>
      <EditableField
        id="account-name"
        label={t("accounts.fields.name.label")}
        value={values.name}
        placeholder={t("accounts.fields.name.placeholder")}
        disabled={disabled}
        error={errors.name}
        validate={(next) => validateAccountNameField(next, t)}
        onSave={(name) => {
          onChange({ name });
          onClearError("name");
        }}
      />

      {showInstitutionPicker ? (
        <InstitutionPicker
          key={accountType}
          id="account-institution"
          accountType={accountType as InstitutionPickerContext}
          value={values.institution}
          disabled={disabled}
          onChange={(institution) => onChange({ institution })}
        />
      ) : (
        <EditableField
          id="account-institution"
          label={t("accounts.fields.institution.label")}
          value={values.institution}
          placeholder={t("accounts.fields.institution.placeholder")}
          disabled={disabled}
          onSave={(institution) => onChange({ institution })}
        />
      )}

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
          onSave={(balance) => {
            onChange({ balance });
            onClearError("balance");
          }}
        />
      ) : null}
    </FormSection>
  );
}
