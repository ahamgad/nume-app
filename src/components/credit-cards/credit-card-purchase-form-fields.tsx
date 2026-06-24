"use client";

import {
  AccountFormDateField,
  AccountFormEditableField,
  AccountFormSection,
  AccountFormSections,
} from "@/components/forms/account-form-section";
import { validateRecordAmountField } from "@/lib/finance/record-form";
import {
  formatAmountInput,
  sanitizeAmountInput,
} from "@/lib/format/currency";
import { useT, useFormatLocale } from "@/providers/i18n-provider";

interface CreditCardPurchaseFormFieldsProps {
  amount: string;
  description: string;
  date: string;
  amountInputLocale: string;
  errors: Record<string, string>;
  disabled?: boolean;
  onAmountChange: (amount: string) => void;
  onDescriptionChange: (description: string) => void;
  onDateChange: (date: string) => void;
  onClearError: (field: string) => void;
}

export function CreditCardPurchaseFormFields({
  amount,
  description,
  date,
  amountInputLocale,
  errors,
  disabled = false,
  onAmountChange,
  onDescriptionChange,
  onDateChange,
  onClearError,
}: CreditCardPurchaseFormFieldsProps) {
  const t = useT();
  const formatLocale = useFormatLocale();

  return (
    <AccountFormSections>
      <AccountFormSection title={t("records.formSections.details")}>
        <AccountFormEditableField
          id="cc-purchase-amount"
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
          id="cc-purchase-date"
          label={t("records.fields.date")}
          value={date}
          locale={formatLocale}
          disabled={disabled}
          required
          onChange={onDateChange}
        />

        <AccountFormEditableField
          id="cc-purchase-description"
          label={t("records.fields.description.label")}
          value={description}
          placeholder={t("creditCards.purchase.descriptionPlaceholder")}
          disabled={disabled}
          required={false}
          onSave={onDescriptionChange}
        />
      </AccountFormSection>
    </AccountFormSections>
  );
}
