import type { MoneyAccountFormValues } from "@/components/accounts/money-account-form-fields";
import type { AccountType } from "@/lib/finance/types";
import type { TranslationKey } from "@/lib/i18n";
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

export type { MoneyAccountFormValues };

export function moneyAccountFormValuesFromAccount(
  account: {
    name: string;
    institution: string | null;
    accountNumberLast4?: string | null;
    currentBalance: number;
  },
  _accountType: AccountType,
): MoneyAccountFormValues {
  return {
    name: account.name,
    institution: account.institution ?? "",
    accountNumber: account.accountNumberLast4 ?? "",
    balance: "",
  };
}

export function isMoneyAccountFormDirty(
  values: MoneyAccountFormValues,
  initial: MoneyAccountFormValues,
  _accountType: AccountType,
): boolean {
  return (
    values.name.trim() !== initial.name.trim() ||
    values.institution.trim() !== initial.institution.trim() ||
    values.accountNumber.trim() !== initial.accountNumber.trim()
  );
}

export function validateMoneyAccountForm(
  values: MoneyAccountFormValues,
  accountType: AccountType,
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

  if (accountType !== "cash" && !values.institution.trim()) {
    errors.institution = t("accounts.validation.institutionRequired");
  }

  const identifierError =
    accountType === "current_account"
      ? validateIdentifierLast4Field(values.accountNumber, t)
      : undefined;
  if (identifierError) errors.accountNumber = identifierError;

  if (mode === "create") {
    const balanceError = validateAccountBalanceField(values.balance, t);
    if (balanceError) errors.balance = balanceError;
  }

  if (options?.identityContext) {
    const identity: AccountIdentityInput = {
      name: values.name,
      institution: accountType === "cash" ? null : values.institution.trim() || null,
      numberLast4:
        accountType === "current_account"
          ? parseOptionalIdentifierLast4(values.accountNumber)
          : null,
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

export function isEditableMoneyAccountType(type: AccountType): boolean {
  return type === "current_account" || type === "wallet" || type === "cash";
}

/** Money accounts and savings that support inline balance editing on the details screen. */
export function supportsQuickBalanceEdit(type: AccountType): boolean {
  return (
    isEditableMoneyAccountType(type) || type === "savings_account"
  );
}

export function showsBalanceField(
  _accountType: AccountType,
  mode: "create" | "edit" = "create",
): boolean {
  return mode === "create";
}

export function showsInstitutionField(accountType: AccountType): boolean {
  return accountType !== "cash";
}
