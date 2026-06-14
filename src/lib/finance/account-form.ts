import type { AccountType } from "@/lib/finance/types";
import type { TranslationKey } from "@/lib/i18n";

export interface MoneyAccountFormValues {
  name: string;
  institution: string;
}

export function moneyAccountFormValuesFromAccount(account: {
  name: string;
  institution: string | null;
}): MoneyAccountFormValues {
  return {
    name: account.name,
    institution: account.institution ?? "",
  };
}

export function isMoneyAccountFormDirty(
  values: MoneyAccountFormValues,
  initial: MoneyAccountFormValues,
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
): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!values.name.trim()) {
    errors.name = t("accounts.validation.nameRequired");
  }
  if (accountType !== "cash" && !values.institution.trim()) {
    errors.institution = t("accounts.validation.institutionRequired");
  }
  return errors;
}

export function isEditableMoneyAccountType(type: AccountType): boolean {
  return type === "current_account" || type === "wallet" || type === "cash";
}
