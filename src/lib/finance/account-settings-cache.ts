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

export function isAccountSettingsOnlyPatch(
  patch: AccountUpdatableFields,
): boolean {
  const keys = Object.keys(patch);
  return (
    keys.length > 0 &&
    keys.every(
      (key) =>
        key === "includeInNetWorth" || key === "includeInEmergencyFund",
    )
  );
}

export function applyAccountPatch<T extends { accounts: Account[] }>(
  data: T | undefined,
  accountId: string,
  patch: AccountUpdatableFields,
): T | undefined {
  if (!data) return data;

  return {
    ...data,
    accounts: data.accounts.map((account) =>
      account.id === accountId ? { ...account, ...patch } : account,
    ),
  };
}
