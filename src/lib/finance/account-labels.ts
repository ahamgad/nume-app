import type { AccountType, MoneyAccountType } from "@/lib/finance/types";
import type { TranslationKey } from "@/lib/i18n";

const TYPE_LABEL_KEYS: Partial<Record<AccountType, TranslationKey>> = {
  current_account: "accounts.types.currentAccount",
  cash: "accounts.types.cash",
  wallet: "accounts.types.wallet",
  savings_account: "accounts.types.savingsAccount",
  certificate: "accounts.types.certificate",
  gold: "accounts.types.gold",
  loan: "accounts.types.loan",
  credit_card: "accounts.types.creditCard",
  stocks: "accounts.types.stocks",
};

/** Compact account type labels for Accounts list cards only. */
const CARD_TYPE_LABEL_KEYS: Partial<Record<AccountType, TranslationKey>> = {
  current_account: "accounts.types.currentAccountCard",
  cash: "accounts.types.cash",
  wallet: "accounts.types.wallet",
  savings_account: "accounts.types.savingsAccountCard",
  certificate: "accounts.types.certificate",
  gold: "accounts.types.gold",
  loan: "accounts.types.loan",
  credit_card: "accounts.types.creditCard",
  stocks: "accounts.types.stocks",
};

export function getAccountTypeLabelKey(type: AccountType): TranslationKey {
  return TYPE_LABEL_KEYS[type] ?? "accounts.types.currentAccount";
}

export function getAccountTypeCardLabelKey(type: AccountType): TranslationKey {
  return CARD_TYPE_LABEL_KEYS[type] ?? "accounts.types.currentAccountCard";
}

export function isKnownAccountTypeLabel(type: AccountType): type is MoneyAccountType | "certificate" | "gold" | "loan" {
  return type in TYPE_LABEL_KEYS;
}

export function getAddAccountScreenTitle(
  type: AccountType,
  t: (key: TranslationKey, params?: Record<string, string | number>) => string,
): string {
  return t("accounts.add.createTitle", { type: t(getAccountTypeLabelKey(type)) });
}
