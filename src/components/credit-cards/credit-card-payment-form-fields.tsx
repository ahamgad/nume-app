"use client";

import {
  AccountFormAccountPicker,
  AccountFormDateField,
  AccountFormEditableField,
  AccountFormSection,
  AccountFormSections,
} from "@/components/forms/account-form-section";
import { validateRecordAmountField } from "@/lib/finance/record-form";
import type { Account } from "@/lib/finance/types";
import {
  formatAmountInput,
  sanitizeAmountInput,
} from "@/lib/format/currency";
import { useT, useFormatLocale } from "@/providers/i18n-provider";

interface CreditCardPaymentFormFieldsProps {
  amount: string;
  description: string;
  date: string;
  paymentSourceAccountId: string | null;
  paymentSourceAccounts: Account[];
  amountInputLocale: string;
  errors: Record<string, string>;
  disabled?: boolean;
  onAmountChange: (amount: string) => void;
  onDescriptionChange: (description: string) => void;
  onDateChange: (date: string) => void;
  onPaymentSourceChange: (accountId: string | null) => void;
  onClearError: (field: string) => void;
}

export function CreditCardPaymentFormFields({
  amount,
  description,
  date,
  paymentSourceAccountId,
  paymentSourceAccounts,
  amountInputLocale,
  errors,
  disabled = false,
  onAmountChange,
  onDescriptionChange,
  onDateChange,
  onPaymentSourceChange,
  onClearError,
}: CreditCardPaymentFormFieldsProps) {
  const t = useT();
  const formatLocale = useFormatLocale();

  return (
    <AccountFormSections>
      <AccountFormSection title={t("records.formSections.details")}>
        <AccountFormEditableField
          id="cc-payment-amount"
          label={t("records.fields.amount")}
          mode="numeric"
          inputMode="decimal"
          value={amount}
          placeholder={t("common.currency.zeroPlaceholder")}
          disabled={disabled}
          error={errors.amount}
          required
          prefixLabel={t("common.currency.code")}
          sanitizeInput={sanitizeAmountInput}
          formatDisplay={(value) => formatAmountInput(value, amountInputLocale)}
          validate={(next) => validateRecordAmountField("expense", next, t)}
          onSave={(next) => {
            onAmountChange(next);
            onClearError("amount");
          }}
        />

        <AccountFormDateField
          id="cc-payment-date"
          label={t("records.fields.date")}
          value={date}
          locale={formatLocale}
          disabled={disabled}
          required
          onChange={onDateChange}
        />

        <AccountFormAccountPicker
          id="cc-payment-source-account"
          label={t("records.fields.transfer.fromAccount")}
          placeholder={t("records.fields.transfer.fromPlaceholder")}
          value={paymentSourceAccountId}
          accounts={paymentSourceAccounts}
          disabled={disabled}
          required
          error={errors.paymentSourceAccountId}
          sheetTitle={t("records.fields.transfer.fromAccount")}
          searchPlaceholder={t("records.fields.transfer.searchPlaceholder")}
          noResultsMessage={t("records.fields.transfer.noResults")}
          onChange={(next) => {
            onPaymentSourceChange(next);
            onClearError("paymentSourceAccountId");
          }}
        />

        <AccountFormEditableField
          id="cc-payment-description"
          label={t("records.fields.description.label")}
          value={description}
          placeholder={t("creditCards.payment.descriptionPlaceholder")}
          disabled={disabled}
          required={false}
          onSave={onDescriptionChange}
        />
      </AccountFormSection>
    </AccountFormSections>
  );
}
