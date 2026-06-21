import {
  validateAccountBalanceField,
  validateAccountNameField,
  validateIdentifierLast4Field,
} from "@/lib/field-editor/field-validators";
import {
  applyDuplicateAccountIdentityError,
  type AccountIdentityInput,
  type AccountIdentityResolverContext,
} from "@/lib/finance/account-identity-validation";
import { parseOptionalIdentifierLast4 } from "@/lib/finance/account-identifier";
import { parseAmount } from "@/lib/format/currency";
import type { TranslationKey } from "@/lib/i18n";
import {
  parsePostingDayFromForm,
  postingDayToFormValue,
} from "@/lib/savings/posting-schedule";

export interface CreditCardFormValues {
  name: string;
  linkedAccountId: string | null;
  identifier: string;
  outstandingBalance: string;
  creditLimit: string;
  statementDueDay: string;
}

export const EMPTY_CREDIT_CARD_FORM_VALUES: CreditCardFormValues = {
  name: "",
  linkedAccountId: null,
  identifier: "",
  outstandingBalance: "",
  creditLimit: "",
  statementDueDay: "15",
};

export function parseCreditCardStatementDueDay(value: string): number | null {
  return parsePostingDayFromForm(value);
}

export function parseCreditLimit(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = parseAmount(trimmed);
  if (parsed === null || parsed <= 0) return null;
  return parsed;
}

export function validateCreditCardForm(
  values: CreditCardFormValues,
  t: (key: TranslationKey) => string,
  mode: "create" | "edit" = "create",
  options?: {
    identityContext?: AccountIdentityResolverContext;
    excludeAccountId?: string;
  },
): Record<string, string> {
  const errors: Record<string, string> = {};
  const nameError = validateAccountNameField(values.name, t);
  if (nameError) errors.name = nameError;

  if (!values.linkedAccountId) {
    errors.linkedAccountId = t("creditCards.validation.linkedAccountRequired");
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

  const creditLimit = parseCreditLimit(values.creditLimit);
  if (creditLimit === null) {
    errors.creditLimit = t("creditCards.validation.creditLimitRequired");
  }

  if (parseCreditCardStatementDueDay(values.statementDueDay) === null) {
    errors.statementDueDay = t("creditCards.validation.statementDayInvalid");
  }

  if (options?.identityContext) {
    const linkedAccount = values.linkedAccountId
      ? options.identityContext.accounts.find(
          (account) => account.id === values.linkedAccountId,
        )
      : undefined;
    const identity: AccountIdentityInput = {
      name: values.name,
      institution: linkedAccount?.institution ?? null,
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

export function creditCardFormValuesFromAccount(
  account: {
    name: string;
  },
  creditCard: {
    cardNumberLast4: string | null;
    paymentDueDay: number;
    creditLimit: number | null;
    paymentSourceAccountId: string | null;
  },
): CreditCardFormValues {
  return {
    name: account.name,
    linkedAccountId: creditCard.paymentSourceAccountId,
    identifier: creditCard.cardNumberLast4 ?? "",
    outstandingBalance: "",
    creditLimit:
      creditCard.creditLimit === null ? "" : String(creditCard.creditLimit),
    statementDueDay: postingDayToFormValue(creditCard.paymentDueDay),
  };
}
