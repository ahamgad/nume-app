import type { Account } from "@/lib/finance/types";

/** Newest account first — used for lists, pickers, and selection experiences. */
export function sortAccountsByCreatedAtDesc(accounts: Account[]): Account[] {
  return [...accounts].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}
