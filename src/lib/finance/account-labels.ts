import type { AccountType, MoneyAccountType } from "@/lib/finance/types";
import type { TranslationKey } from "@/lib/i18n";

const TYPE_LABEL_KEYS: Record<MoneyAccountType | "certificate", TranslationKey> = {
  current_account: "accounts.types.currentAccount",
  cash: "accounts.types.cash",
  wallet: "accounts.types.wallet",
  certificate: "accounts.types.certificate",
};

export function getAccountTypeLabelKey(type: AccountType): TranslationKey {
  if (type in TYPE_LABEL_KEYS) {
    return TYPE_LABEL_KEYS[type as MoneyAccountType | "certificate"];
  }
  return "accounts.types.currentAccount";
}
