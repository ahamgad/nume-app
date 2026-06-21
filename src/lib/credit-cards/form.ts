import {
  validateAccountBalanceField,
  validateAccountNameField,
  validateIdentifierLast4Field,
} from "@/lib/field-editor/field-validators";
import { parseAmount } from "@/lib/format/currency";
import type { TranslationKey } from "@/lib/i18n";

export interface CreditCardFormValues {
  name: string;
  institution: string;
  identifier: string;
  outstandingBalance: string;
  creditLimit: string;
  statementCloseDay: string;
  paymentDueDay: string;
  paymentSourceAccountId: string | null;
  includeInNetWorth: boolean;
  includeInEmergencyFund: boolean;
}

export const EMPTY_CREDIT_CARD_FORM_VALUES: CreditCardFormValues = {
  name: "",
  institution: "",
  identifier: "",
  outstandingBalance: "",
  creditLimit: "",
  statementCloseDay: "1",
  paymentDueDay: "15",
  paymentSourceAccountId: null,
  includeInNetWorth: true,
  includeInEmergencyFund: false,
};

export function parseCreditCardDay(value: string): number | null {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 28) return null;
  return parsed;
}

export function parseOptionalCreditLimit(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = parseAmount(trimmed);
  if (parsed === null || parsed < 0) return null;
  return parsed;
}

export function validateCreditCardForm(
  values: CreditCardFormValues,
  t: (key: TranslationKey) => string,
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
    const balanceError = validateAccountBalanceField(
      values.outstandingBalance,
      t,
    );
    if (balanceError) errors.outstandingBalance = balanceError;
  }

  if (values.creditLimit.trim()) {
    const limit = parseOptionalCreditLimit(values.creditLimit);
    if (limit === null) {
      errors.creditLimit = t("creditCards.validation.creditLimitInvalid");
    }
  }

  if (parseCreditCardDay(values.statementCloseDay) === null) {
    errors.statementCloseDay = t("creditCards.validation.statementDayInvalid");
  }
  if (parseCreditCardDay(values.paymentDueDay) === null) {
    errors.paymentDueDay = t("creditCards.validation.statementDayInvalid");
  }

  return errors;
}

export function creditCardFormValuesFromAccount(
  account: {
    name: string;
    institution: string | null;
    includeInNetWorth: boolean;
    includeInEmergencyFund: boolean;
  },
  creditCard: {
    cardNumberLast4: string | null;
    statementCloseDay: number;
    paymentDueDay: number;
    creditLimit: number | null;
    paymentSourceAccountId: string | null;
  },
): CreditCardFormValues {
  return {
    name: account.name,
    institution: account.institution ?? "",
    identifier: creditCard.cardNumberLast4 ?? "",
    outstandingBalance: "",
    creditLimit:
      creditCard.creditLimit === null ? "" : String(creditCard.creditLimit),
    statementCloseDay: String(creditCard.statementCloseDay),
    paymentDueDay: String(creditCard.paymentDueDay),
    paymentSourceAccountId: creditCard.paymentSourceAccountId,
    includeInNetWorth: account.includeInNetWorth,
    includeInEmergencyFund: account.includeInEmergencyFund,
  };
}
