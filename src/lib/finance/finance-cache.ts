import type { QueryClient } from "@tanstack/react-query";

import { preserveBalanceTimestamps } from "@/lib/finance/account-settings-cache";
import type { Account } from "@/lib/finance/types";

export const FINANCE_QUERY_KEY = "finance";

export interface FinanceCacheSnapshot {
  accounts: Account[];
  records: import("@/lib/finance/types").FinanceRecord[];
  certificates: import("@/lib/certificates/types").Certificate[];
  certificateSchedules: import("@/lib/certificates/types").CertificateScheduleEntry[];
  savingsAccounts: import("@/lib/savings/types").SavingsAccount[];
  loans: import("@/lib/lending/types").Loan[];
  creditCards: import("@/lib/credit-cards/types").CreditCard[];
}

export function financeQueryKey(userId: string) {
  return [FINANCE_QUERY_KEY, userId] as const;
}

export function mergeFinanceCacheSnapshot<T extends { accounts: Account[] }>(
  previous: T | undefined,
  next: T,
): T {
  if (!previous) return next;
  return preserveBalanceTimestamps(previous, next);
}

export function shareFinanceCacheSnapshot(
  previous: unknown,
  next: unknown,
): unknown {
  if (!previous || !next) return next;
  return mergeFinanceCacheSnapshot(
    previous as FinanceCacheSnapshot,
    next as FinanceCacheSnapshot,
  );
}

export function writeFinanceCache(
  queryClient: QueryClient,
  userId: string,
  updater: (
    current: FinanceCacheSnapshot | undefined,
  ) => FinanceCacheSnapshot | undefined,
) {
  queryClient.setQueryData<FinanceCacheSnapshot>(financeQueryKey(userId), (current) => {
    const next = updater(current);
    if (!next) return next;
    return mergeFinanceCacheSnapshot(current, next);
  });
}
