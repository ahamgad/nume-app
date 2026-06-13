import type { Certificate } from "@/lib/certificates/types";
import {
  calculateAvailableWealth,
  calculateLockedCertificatePrincipal,
} from "./available-wealth";
import type { Account, NetWorthSummary } from "./types";

export function calculateNetWorth(
  accounts: Account[],
  certificates: Certificate[] = [],
): NetWorthSummary {
  const activeAccounts = accounts.filter((a) => a.status === "active");

  const includedAssets = activeAccounts
    .filter((a) => a.includeInNetWorth)
    .reduce((sum, a) => sum + Math.max(a.currentBalance, 0), 0);

  const includedLiabilities = activeAccounts
    .filter((a) => a.includeInNetWorth)
    .reduce((sum, a) => sum + Math.max(-a.currentBalance, 0), 0);

  const netWorth = includedAssets - includedLiabilities;
  const lockedCertificatePrincipal = calculateLockedCertificatePrincipal(
    accounts,
    certificates,
  );
  const availableWealth = calculateAvailableWealth(
    netWorth,
    lockedCertificatePrincipal,
  );

  return {
    netWorth,
    assets: includedAssets,
    liabilities: includedLiabilities,
    lockedCertificatePrincipal,
    availableWealth,
  };
}
