import type { Account, AccountType } from "@/lib/finance/types";

/**
 * Shared wealth capability rules (NUME v1 — phase 3.2).
 *
 * Settlement accounts can receive transfers, interest payouts, and other
 * money-in flows. Wealth-only accounts hold value but are not payout endpoints.
 *
 * Future asset types (Gold, etc.) must reuse these helpers — do not hardcode
 * certificate-specific filters in UI components.
 */

/** Accounts that may receive interest, transfers, and automation payouts. */
export const SETTLEMENT_ACCOUNT_TYPES = new Set<AccountType>([
  "current_account",
  "wallet",
  "savings_account",
]);

/** Wealth holdings excluded from destination / settlement pickers. */
export const WEALTH_ONLY_ACCOUNT_TYPES = new Set<AccountType>([
  "cash",
  "certificate",
  "gold",
  "loan",
  "credit_card",
  "stocks",
]);

export function isSettlementAccountType(type: AccountType): boolean {
  return SETTLEMENT_ACCOUNT_TYPES.has(type);
}

export function isWealthOnlyAccountType(type: AccountType): boolean {
  return WEALTH_ONLY_ACCOUNT_TYPES.has(type);
}

/** Whether an account can receive transfers and appear in destination pickers. */
export function canReceiveTransfers(
  account: Pick<Account, "type" | "status">,
): boolean {
  return account.status === "active" && isSettlementAccountType(account.type);
}

export function getSettlementAccounts(accounts: Account[]): Account[] {
  return accounts.filter(canReceiveTransfers);
}

export function filterSettlementAccounts(
  accounts: Account[],
  options?: { excludeAccountIds?: string[] },
): Account[] {
  const exclude = new Set(options?.excludeAccountIds ?? []);
  return getSettlementAccounts(accounts).filter(
    (account) => !exclude.has(account.id),
  );
}
