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
  accountType: AccountType,
): MoneyAccountFormValues {
  return {
    name: account.name,
    institution: account.institution ?? "",
    balance:
      accountType === "cash" ? String(account.currentBalance) : "",
  };
}

export function isMoneyAccountFormDirty(
  values: MoneyAccountFormValues,
  initial: MoneyAccountFormValues,
  accountType: AccountType,
): boolean {
  const baseDirty =
    values.name.trim() !== initial.name.trim() ||
    values.institution.trim() !== initial.institution.trim();

  if (accountType === "cash") {
    return baseDirty || values.balance.trim() !== initial.balance.trim();
  }

  return baseDirty;
}

export function validateMoneyAccountForm(
  values: MoneyAccountFormValues,
  accountType: AccountType,
  t: (key: TranslationKey) => string,
): Record<string, string> {
  const errors: Record<string, string> = {};
  const nameError = validateAccountNameField(values.name, t);
  if (nameError) errors.name = nameError;

  if (accountType !== "cash" && !values.institution.trim()) {
    errors.institution = t("accounts.validation.institutionRequired");
  }

  if (accountType === "cash") {
    const balanceError = validateAccountBalanceField(values.balance, t);
    if (balanceError) errors.balance = balanceError;
  }

  return errors;
}

export function isEditableMoneyAccountType(type: AccountType): boolean {
  return type === "current_account" || type === "wallet" || type === "cash";
}
