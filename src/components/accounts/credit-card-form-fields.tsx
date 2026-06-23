"use client";

import { AccountIdentifierField } from "@/components/accounts/account-identifier-field";
import { AccountFormSection, AccountFormSections } from "@/components/forms/account-form-section";
import { EditableField } from "@/components/field-editor";
import { AccountPicker } from "@/components/ui/account-picker";
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
import { POSTING_DAY_FORM_LAST } from "@/lib/savings/posting-schedule";
import { useT } from "@/providers/i18n-provider";

const STATEMENT_DAYS = Array.from({ length: 28 }, (_, index) => index + 1);

interface CreditCardFormFieldsProps {
  values: CreditCardFormValues;
  errors: Record<string, string>;
  amountInputLocale: string;
  linkedAccounts: Account[];
  disabled?: boolean;
  mode?: "create" | "edit";
  onChange: (patch: Partial<CreditCardFormValues>) => void;
  onClearError: (field: string) => void;
}

export function CreditCardFormFields({
  values,
  errors,
  amountInputLocale,
  linkedAccounts,
  disabled = false,
  mode = "create",
  onChange,
  onClearError,
}: CreditCardFormFieldsProps) {
  const t = useT();

  const statementDueDayOptions: ScrollChipOption<string>[] = [
    ...STATEMENT_DAYS.map((day) => ({
      value: String(day),
      label: String(day),
    })),
    {
      value: POSTING_DAY_FORM_LAST,
      label: t("savings.fields.postingDay.lastOfMonth"),
    },
  ];

  return (
    <AccountFormSections>
      <AccountFormSection title={t("accounts.formSections.accountDetails")}>
        <EditableField
          id="credit-card-name"
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

        <AccountPicker
          id="credit-card-linked-account"
          label={t("creditCards.fields.linkedAccount.label")}
          placeholder={t("creditCards.fields.linkedAccount.placeholder")}
          description={t("creditCards.fields.linkedAccount.description")}
          searchPlaceholder={t("creditCards.fields.linkedAccount.searchPlaceholder")}
          noResultsMessage={t("creditCards.fields.linkedAccount.noResults")}
          value={values.linkedAccountId}
          accounts={linkedAccounts}
          disabled={disabled}
          required
          error={errors.linkedAccountId}
          variant="row"
          onChange={(linkedAccountId) => {
            onChange({ linkedAccountId });
            onClearError("linkedAccountId");
          }}
        />

        <AccountIdentifierField
          id="credit-card-identifier"
          labelKey="accounts.fields.cardNumber.label"
          placeholderKey="accounts.fields.cardNumber.placeholder"
          value={values.identifier}
          disabled={disabled}
          error={errors.identifier}
          variant="row"
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
            variant="row"
            sanitizeInput={sanitizeAmountInput}
            formatDisplay={(amount) => formatAmountInput(amount, amountInputLocale)}
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
          placeholder="0"
          disabled={disabled}
          error={errors.creditLimit}
          variant="row"
          sanitizeInput={sanitizeDecimalInput}
          formatDisplay={(amount) => formatAmountInput(amount, amountInputLocale)}
          onSave={(creditLimit) => {
            onChange({ creditLimit });
            onClearError("creditLimit");
          }}
        />
      </AccountFormSection>

      <AccountFormSection title={t("creditCards.formSections.statement")}>
        <ScrollChipSelect
          label={t("creditCards.fields.statementDueDay.label")}
          required
          fieldId="credit-card-statement-due-day"
          value={values.statementDueDay}
          options={statementDueDayOptions}
          ariaLabel={t("creditCards.fields.statementDueDay.label")}
          error={errors.statementDueDay}
          onChange={(statementDueDay) => {
            onChange({ statementDueDay });
            onClearError("statementDueDay");
          }}
        />
      </AccountFormSection>
    </AccountFormSections>
  );
}
