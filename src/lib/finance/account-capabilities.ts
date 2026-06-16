import type { Account, AccountType } from "@/lib/finance/types";

/**
 * Shared wealth capability rules (NUME v1 — phase 3.2).
 *
 * Transfer-capable accounts can send and receive internal transfers.
 * Wealth-only accounts hold value but are not transfer endpoints.
 *
 * Future asset types (Gold, etc.) must reuse these helpers — do not hardcode
 * certificate-specific filters in UI components.
 */

/** Accounts that may send or receive internal transfers. */
export const TRANSFER_CAPABLE_ACCOUNT_TYPES = new Set<AccountType>([
  "current_account",
  "cash",
  "wallet",
  "savings_account",
]);

/** @deprecated Alias — settlement pickers use the same eligibility as transfers. */
export const SETTLEMENT_ACCOUNT_TYPES = TRANSFER_CAPABLE_ACCOUNT_TYPES;

/** Wealth holdings excluded from transfer / destination pickers. */
export const WEALTH_ONLY_ACCOUNT_TYPES = new Set<AccountType>([
  "certificate",
  "gold",
  "loan",
  "credit_card",
  "stocks",
]);

export function isTransferCapableAccountType(type: AccountType): boolean {
  return TRANSFER_CAPABLE_ACCOUNT_TYPES.has(type);
}

/** @deprecated Use isTransferCapableAccountType */
export function isSettlementAccountType(type: AccountType): boolean {
  return isTransferCapableAccountType(type);
}

export function isWealthOnlyAccountType(type: AccountType): boolean {
  return WEALTH_ONLY_ACCOUNT_TYPES.has(type);
}

/** Whether an account can send transfers and appear in source pickers. */
export function canSendTransfers(
  account: Pick<Account, "type" | "status">,
): boolean {
  return account.status === "active" && isTransferCapableAccountType(account.type);
}

/**
 * Whether an account can receive transfers and appear in destination pickers.
 * Same rule set as interest destination accounts (Phase 3.1).
 *
 * Future: extend TRANSFER_CAPABLE_ACCOUNT_TYPES with loan and credit_card
 * when repayment transfer flows ship.
 */
export function canReceiveTransfers(
  account: Pick<Account, "type" | "status">,
): boolean {
  return account.status === "active" && isTransferCapableAccountType(account.type);
}

export function getTransferCapableAccounts(accounts: Account[]): Account[] {
  return accounts.filter(canReceiveTransfers);
}

/** @deprecated Use getTransferCapableAccounts */
export function getSettlementAccounts(accounts: Account[]): Account[] {
  return getTransferCapableAccounts(accounts);
}

export function filterTransferAccounts(
  accounts: Account[],
  options?: { excludeAccountIds?: string[] },
): Account[] {
  const exclude = new Set(options?.excludeAccountIds ?? []);
  return getTransferCapableAccounts(accounts).filter(
    (account) => !exclude.has(account.id),
  );
}

/** @deprecated Use filterTransferAccounts */
export function filterSettlementAccounts(
  accounts: Account[],
  options?: { excludeAccountIds?: string[] },
): Account[] {
  return filterTransferAccounts(accounts, options);
}
