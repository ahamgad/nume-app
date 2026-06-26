import type { Account } from "@/lib/finance/types";

export type AccountUpdatableFields = Partial<
  Pick<
    Account,
    | "name"
    | "institution"
    | "accountNumberLast4"
    | "includeInNetWorth"
    | "includeInEmergencyFund"
    | "currentBalance"
  >
>;

/** True when the patch cannot change account balance (metadata / settings only). */
export function isNonBalanceAccountPatch(
  patch: AccountUpdatableFields,
): boolean {
  return Object.keys(patch).length > 0 && patch.currentBalance === undefined;
}

/** @deprecated Use isNonBalanceAccountPatch */
export const isAccountSettingsOnlyPatch = isNonBalanceAccountPatch;

export function applyAccountPatch<T extends { accounts: Account[] }>(
  data: T | undefined,
  accountId: string,
  patch: AccountUpdatableFields,
): T | undefined {
  if (!data) return data;

  return {
    ...data,
    accounts: data.accounts.map((account) => {
      if (account.id !== accountId) return account;

      const next = { ...account, ...patch };
      if (patch.currentBalance === undefined) {
        next.updatedAt = account.updatedAt;
      }
      return next;
    }),
  };
}

/** Keep balance timestamps when a refetch returns unchanged balances. */
export function preserveBalanceTimestamps<T extends { accounts: Account[] }>(
  previous: T,
  next: T,
): T {
  const previousById = new Map(
    previous.accounts.map((account) => [account.id, account]),
  );

  return {
    ...next,
    accounts: next.accounts.map((account) => {
      const prior = previousById.get(account.id);
      if (
        prior &&
        prior.currentBalance === account.currentBalance &&
        prior.updatedAt !== account.updatedAt
      ) {
        return { ...account, updatedAt: prior.updatedAt };
      }
      return account;
    }),
  };
}
