import type { SupabaseClient } from "@supabase/supabase-js";

import {
  canReceiveTransfers,
  filterTransferAccounts,
} from "@/lib/finance/account-capabilities";
import type { Account } from "@/lib/finance/types";

/**
 * Destination eligibility (Phase 3.1 final rules).
 *
 * Interest and transfer destination pickers share the same active-account types:
 * current_account, savings_account, wallet, cash.
 *
 * Wealth-only types (certificate, gold, stocks, loan, credit_card) are excluded.
 * Institution catalog membership is not required.
 *
 * Future: loan and credit_card may become transfer destinations for repayments.
 * See docs/phase-3.1-certificates-domain.md.
 */

/** Whether an account may receive interest or transfer inflows. */
export function canBeDestinationAccount(
  account: Pick<Account, "type" | "status">,
): boolean {
  return canReceiveTransfers(account);
}

/** Active destination-eligible accounts for pickers. */
export function filterDestinationAccounts(
  accounts: Account[],
  options?: { excludeAccountIds?: string[] },
): Account[] {
  return filterTransferAccounts(accounts, options);
}

/** @deprecated Alias — use filterDestinationAccounts */
export const filterInterestDestinationAccounts = filterDestinationAccounts;

export async function assertDestinationAccount(
  supabase: SupabaseClient,
  userId: string,
  destinationAccountId: string | null | undefined,
  options?: { excludeAccountId?: string },
): Promise<void> {
  if (!destinationAccountId) return;

  const { data, error } = await supabase
    .from("accounts")
    .select("id, account_type, status")
    .eq("id", destinationAccountId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error("Destination account not found");

  if (options?.excludeAccountId && data.id === options.excludeAccountId) {
    throw new Error("Destination account cannot be the same account");
  }

  if (
    !canBeDestinationAccount({
      type: data.account_type,
      status: data.status,
    })
  ) {
    throw new Error("Destination account cannot receive transfers");
  }
}
