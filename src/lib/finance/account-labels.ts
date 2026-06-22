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

/** First letter of the localized account type name (logo fallback on account details). */
export function getAccountTypeInitial(
  type: AccountType,
  t: (key: TranslationKey) => string,
): string {
  const label = t(getAccountTypeLabelKey(type)).trim();
  if (!label) return "?";
  return label.charAt(0).toUpperCase();
}

export function getAccountTypeCardLabelKey(type: AccountType): TranslationKey {
  return getAccountTypeLabelKey(type);
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
