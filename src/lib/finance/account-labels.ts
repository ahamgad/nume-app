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

export function getAccountTypeLabelKey(type: AccountType): TranslationKey {
  return TYPE_LABEL_KEYS[type] ?? "accounts.types.currentAccount";
}

export function isKnownAccountTypeLabel(type: AccountType): type is MoneyAccountType | "certificate" | "gold" | "loan" {
  return type in TYPE_LABEL_KEYS;
}
