import type { Account, NetWorthSummary } from "./types";

export function calculateNetWorth(accounts: Account[]): NetWorthSummary {
  const activeAccounts = accounts.filter((a) => a.status === "active");

  const includedAssets = activeAccounts
    .filter((a) => a.includeInNetWorth)
    .reduce((sum, a) => sum + Math.max(a.currentBalance, 0), 0);

  const includedLiabilities = activeAccounts
    .filter((a) => a.includeInNetWorth)
    .reduce((sum, a) => sum + Math.max(-a.currentBalance, 0), 0);

  return {
    netWorth: includedAssets - includedLiabilities,
    assets: includedAssets,
    liabilities: includedLiabilities,
  };
}
