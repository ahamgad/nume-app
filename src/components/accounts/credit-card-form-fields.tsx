"use client";

import {
  AccountFormAccountPicker,
  AccountFormEditableField,
  AccountFormIdentifierField,
  AccountFormScrollChipSelect,
  AccountFormSection,
  AccountFormSections,
  type ScrollChipOption,
} from "@/components/forms/account-form-section";
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
    <AccountFormSections
      requirements={{
        mode,
        accountType: "credit_card",
        showsIdentifier: true,
        showsBalance: mode === "create",
      }}
    >
      <AccountFormSection title={t("accounts.formSections.accountDetails")}>
        <AccountFormEditableField
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

        <AccountFormAccountPicker
          id="credit-card-linked-account"
          label={t("creditCards.fields.linkedAccount.label")}
          placeholder={t("creditCards.fields.linkedAccount.placeholder")}
          description={t("creditCards.fields.linkedAccount.description")}
          searchPlaceholder={t("creditCards.fields.linkedAccount.searchPlaceholder")}
          noResultsMessage={t("creditCards.fields.linkedAccount.noResults")}
          value={values.linkedAccountId}
          accounts={linkedAccounts}
          disabled={disabled}
          error={errors.linkedAccountId}
          onChange={(linkedAccountId) => {
            onChange({ linkedAccountId });
            onClearError("linkedAccountId");
          }}
        />

        <AccountFormIdentifierField
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
          <AccountFormEditableField
            id="credit-card-outstanding"
            label={t("creditCards.fields.outstandingBalance.label")}
            mode="numeric"
            inputMode="decimal"
            value={values.outstandingBalance}
            placeholder={t("common.currency.zeroPlaceholder")}
            disabled={disabled}
            error={errors.outstandingBalance}
            sanitizeInput={sanitizeAmountInput}
            formatDisplay={(amount) => formatAmountInput(amount, amountInputLocale)}
            validate={(next) => validateAccountBalanceField(next, t)}
            onSave={(outstandingBalance) => {
              onChange({ outstandingBalance });
              onClearError("outstandingBalance");
            }}
          />
        ) : null}

        <AccountFormEditableField
          id="credit-card-limit"
          label={t("creditCards.fields.creditLimit.label")}
          mode="numeric"
          inputMode="decimal"
          value={values.creditLimit}
          placeholder="0"
          disabled={disabled}
          error={errors.creditLimit}
          sanitizeInput={sanitizeDecimalInput}
          formatDisplay={(amount) => formatAmountInput(amount, amountInputLocale)}
          onSave={(creditLimit) => {
            onChange({ creditLimit });
            onClearError("creditLimit");
          }}
        />
      </AccountFormSection>

      <AccountFormSection title={t("creditCards.formSections.statement")}>
        <AccountFormScrollChipSelect
          fieldId="credit-card-statement-due-day"
          label={t("creditCards.fields.statementDueDay.label")}
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
