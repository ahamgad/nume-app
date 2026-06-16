import type { AccountType, MoneyAccountType } from "@/lib/finance/types";

/** Account types selectable in Add Account (after first-account onboarding). */
export const ADD_ACCOUNT_TYPES: AccountType[] = [
  "current_account",
  "cash",
  "wallet",
  "certificate",
];

export interface OnboardingAccountTypeOption {
  type: AccountType;
  enabled: boolean;
}

/** First-account onboarding: show full wealth scope; only money types enabled. */
export const ONBOARDING_ACCOUNT_TYPES: OnboardingAccountTypeOption[] = [
  { type: "current_account", enabled: true },
  { type: "cash", enabled: true },
  { type: "wallet", enabled: true },
  { type: "certificate", enabled: false },
  { type: "gold", enabled: false },
  { type: "loan", enabled: false },
];

export function isMoneyAccountType(type: AccountType): type is MoneyAccountType {
  return type === "current_account" || type === "cash" || type === "wallet";
}

export function isCertificateAccountType(type: AccountType): boolean {
  return type === "certificate";
}

export function isSavingsAccountType(type: AccountType): boolean {
  return type === "savings_account";
}

export function isEnabledOnboardingAccountType(type: AccountType): boolean {
  return ONBOARDING_ACCOUNT_TYPES.some(
    (option) => option.type === type && option.enabled,
  );
}
