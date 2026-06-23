import type { AccountType } from "@/lib/finance/types";
import type { CurrencySignMode } from "@/lib/format/currency-display";
import { toDisplayOutstandingBalance } from "@/lib/credit-cards/balance";

/** Global balance sign mode — no + prefix for positive; − prefix for negative. */
export const BALANCE_DISPLAY_SIGN_MODE: CurrencySignMode = "balance";

/** Unified monetary value color — no semantic green/red tones. */
export const BALANCE_DISPLAY_CLASS = "text-foreground";

/** @deprecated Use {@link BALANCE_DISPLAY_SIGN_MODE}. */
export const ACCOUNT_DETAILS_BALANCE_SIGN_MODE = BALANCE_DISPLAY_SIGN_MODE;

/** @deprecated Use {@link BALANCE_DISPLAY_CLASS}. */
export const ACCOUNT_DETAILS_BALANCE_CLASS = BALANCE_DISPLAY_CLASS;

export interface BalanceDisplayProps {
  signMode: CurrencySignMode;
  className: string;
}

/** Sign and color rules for all monetary balance displays app-wide. */
export function getBalanceDisplayProps(): BalanceDisplayProps {
  return {
    signMode: BALANCE_DISPLAY_SIGN_MODE,
    className: BALANCE_DISPLAY_CLASS,
  };
}

/** @deprecated Use {@link getBalanceDisplayProps}. */
export function getAccountDetailsBalanceDisplayProps(): BalanceDisplayProps {
  return getBalanceDisplayProps();
}

export function isLiabilityAccountType(type: AccountType): boolean {
  return type === "credit_card" || type === "loan";
}

export function getAccountDisplayBalance(
  account: Pick<AccountTypeFields, "type" | "currentBalance">,
): number {
  if (isLiabilityAccountType(account.type)) {
    return toDisplayOutstandingBalance(account.currentBalance);
  }
  return account.currentBalance;
}

interface AccountTypeFields {
  type: AccountType;
  currentBalance: number;
}

/** @deprecated Use {@link BALANCE_DISPLAY_CLASS} via {@link getBalanceDisplayProps}. */
export function getBalanceToneClassName(
  account?: Pick<AccountTypeFields, "type" | "currentBalance">,
): string {
  void account;
  return BALANCE_DISPLAY_CLASS;
}
