import type { AccountType } from "@/lib/finance/types";
import type { CurrencySignMode } from "@/lib/format/currency-display";
import { toDisplayOutstandingBalance } from "@/lib/credit-cards/balance";

export const ACCOUNT_DETAILS_BALANCE_SIGN_MODE: CurrencySignMode = "balance";

/** Unified balance color for account detail hero amounts — no semantic green/red. */
export const ACCOUNT_DETAILS_BALANCE_CLASS = "text-foreground";

export interface AccountDetailsBalanceDisplayProps {
  signMode: CurrencySignMode;
  className: string;
}

/** Sign and color rules for account detail balance heroes. */
export function getAccountDetailsBalanceDisplayProps(): AccountDetailsBalanceDisplayProps {
  return {
    signMode: ACCOUNT_DETAILS_BALANCE_SIGN_MODE,
    className: ACCOUNT_DETAILS_BALANCE_CLASS,
  };
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

/** Semantic balance color for account lists and summary cards. */
export function getBalanceToneClassName(
  account: Pick<AccountTypeFields, "type" | "currentBalance">,
): string | undefined {
  const amount = getAccountDisplayBalance(account);
  if (amount === 0) return undefined;

  if (isLiabilityAccountType(account.type)) {
    return "text-destructive";
  }

  if (amount > 0) {
    return "text-emerald-700 dark:text-emerald-300";
  }

  return "text-destructive";
}
