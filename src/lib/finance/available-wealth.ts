import type { Certificate } from "@/lib/certificates/types";
import type { Account } from "@/lib/finance/types";

/** Sum of active certificate principals included in net worth (locked until maturity). */
export function calculateLockedCertificatePrincipal(
  accounts: Account[],
  certificates: Certificate[],
): number {
  const activeCertificateAccountIds = new Set(
    certificates
      .filter((certificate) => certificate.status !== "archived")
      .map((certificate) => certificate.accountId),
  );

  return accounts
    .filter(
      (account) =>
        account.status === "active" &&
        account.type === "certificate" &&
        account.includeInNetWorth &&
        activeCertificateAccountIds.has(account.id),
    )
    .reduce((sum, account) => sum + Math.max(account.currentBalance, 0), 0);
}

/**
 * Available Wealth = Net Worth − Required Emergency Fund − Locked Certificate Principal.
 * Required EF is 0 until Planning ships.
 */
export function calculateAvailableWealth(
  netWorth: number,
  lockedCertificatePrincipal: number,
  requiredEmergencyFund = 0,
): number {
  return netWorth - requiredEmergencyFund - lockedCertificatePrincipal;
}
