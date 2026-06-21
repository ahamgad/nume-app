import { toDisplayOutstandingBalance } from "@/lib/credit-cards/balance";

export function calculateCreditUtilization(
  storedBalance: number,
  creditLimit: number | null,
): number | null {
  if (creditLimit === null || creditLimit <= 0) return null;
  const outstanding = toDisplayOutstandingBalance(storedBalance);
  if (outstanding <= 0) return 0;
  return Math.min(100, Math.round((outstanding / creditLimit) * 100));
}

export function calculateAvailableCredit(
  storedBalance: number,
  creditLimit: number | null,
): number | null {
  if (creditLimit === null || creditLimit <= 0) return null;
  const outstanding = toDisplayOutstandingBalance(storedBalance);
  return Math.max(0, creditLimit - outstanding);
}
