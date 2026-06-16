import type { MoneyAccountFormValues } from "@/components/accounts/money-account-form-fields";
import type { AccountType } from "@/lib/finance/types";
import type { TranslationKey } from "@/lib/i18n";
import {
  validateAccountBalanceField,
  validateAccountNameField,
} from "@/lib/field-editor/field-validators";

export type { MoneyAccountFormValues };

export function moneyAccountFormValuesFromAccount(
  account: {
    name: string;
    institution: string | null;
    currentBalance: number;
  },
  _accountType: AccountType,
): MoneyAccountFormValues {
  return {
    name: account.name,
    institution: account.institution ?? "",
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
    values.institution.trim() !== initial.institution.trim()
  );
}

export function validateMoneyAccountForm(
  values: MoneyAccountFormValues,
  accountType: AccountType,
  t: (key: TranslationKey) => string,
  mode: "create" | "edit" = "create",
): Record<string, string> {
  const errors: Record<string, string> = {};
  const nameError = validateAccountNameField(values.name, t);
  if (nameError) errors.name = nameError;

  if (accountType !== "cash" && !values.institution.trim()) {
    errors.institution = t("accounts.validation.institutionRequired");
  }

  if (mode === "create") {
    const balanceError = validateAccountBalanceField(values.balance, t);
    if (balanceError) errors.balance = balanceError;
  }

  return errors;
}

export function isEditableMoneyAccountType(type: AccountType): boolean {
  return type === "current_account" || type === "wallet" || type === "cash";
}

/** Money accounts that support inline balance editing on the details screen. */
export function supportsQuickBalanceEdit(type: AccountType): boolean {
  return isEditableMoneyAccountType(type);
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
