import type { AccountType } from "@/lib/finance/types";
import { toDisplayOutstandingBalance } from "@/lib/credit-cards/balance";

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
