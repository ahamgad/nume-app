import { isFutureDate } from "@/lib/format/date";
import { parseAmount } from "@/lib/format/currency";
import type { RecordType } from "@/lib/finance/types";
import type { TranslationKey } from "@/lib/i18n";

export interface RecordFormValues {
  amount: string;
  description: string;
  date: string;
  fromAccountId: string | null;
  toAccountId: string | null;
}

export const DEFAULT_RECORD_FORM_VALUES: RecordFormValues = {
  amount: "",
  description: "",
  date: "",
  fromAccountId: null,
  toAccountId: null,
};

export function validateRecordForm(
  type: RecordType,
  values: RecordFormValues,
  t: (key: TranslationKey) => string,
  options?: {
    currentBalance?: number;
  },
): Record<string, string> {
  const errors: Record<string, string> = {};
  const parsedAmount = parseAmount(values.amount);

  if (parsedAmount === null) {
    errors.amount =
      type === "adjustment"
        ? t("records.validation.correctBalanceRequired")
        : t("records.validation.amountRequired");
  } else if (parsedAmount <= 0 && type !== "adjustment") {
    errors.amount = t("records.validation.amountZero");
  } else if (
    type === "adjustment" &&
    options?.currentBalance !== undefined &&
    parsedAmount === options.currentBalance
  ) {
    errors.amount = t("records.adjustmentNoChange");
  }

  if (!values.date) {
    errors.date = t("records.validation.dateRequired");
  } else if (isFutureDate(values.date)) {
    errors.date = t("records.validation.dateFuture");
  }

  if (type === "transfer") {
    if (!values.fromAccountId) {
      errors.fromAccountId = t("records.validation.fromAccountRequired");
    }
    if (!values.toAccountId) {
      errors.toAccountId = t(
        "accounts.validation.interestDestinationAccountRequired",
      );
    }
    if (
      values.fromAccountId &&
      values.toAccountId &&
      values.fromAccountId === values.toAccountId
    ) {
      errors.toAccountId = t("records.validation.transferSameAccount");
    }
  }

  return errors;
}

export function validateRecordAmountField(
  type: RecordType,
  value: string,
  t: (key: TranslationKey) => string,
  currentBalance?: number,
): string | undefined {
  const parsed = parseAmount(value);
  if (parsed === null) {
    return type === "adjustment"
      ? t("records.validation.correctBalanceRequired")
      : t("records.validation.amountRequired");
  }
  if (parsed <= 0 && type !== "adjustment") {
    return t("records.validation.amountZero");
  }
  if (
    type === "adjustment" &&
    currentBalance !== undefined &&
    parsed === currentBalance
  ) {
    return t("records.adjustmentNoChange");
  }
}
