import type { AccountType, MoneyAccountType } from "@/lib/finance/types";

/** Account types selectable in Add Account (after first-account onboarding). */
export const ADD_ACCOUNT_TYPES: AccountType[] = [
  "current_account",
  "cash",
  "wallet",
  "certificate",
];

export function isMoneyAccountType(type: AccountType): type is MoneyAccountType {
  return type === "current_account" || type === "cash" || type === "wallet";
}

export function isCertificateAccountType(type: AccountType): boolean {
  return type === "certificate";
}
