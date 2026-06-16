import type { SupabaseClient } from "@supabase/supabase-js";

import {
  mapSavingsAccount,
  type DbSavingsAccount,
} from "@/lib/savings/mappers";
import type { SavingsAccount } from "@/lib/savings/types";
import { logSupabaseError } from "@/lib/supabase/errors";

export function isMissingSavingsTableError(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;
  const record = error as Record<string, unknown>;
  if (record.code === "PGRST205") return true;
  if (typeof record.message === "string") {
    return (
      record.message.includes("public.savings_accounts") ||
      record.message.includes("public.savings_interest_tiers")
    );
  }
  return false;
}

export async function getSavingsAccountsSafe(
  supabase: SupabaseClient,
  userId: string,
): Promise<SavingsAccount[]> {
  const { data, error } = await supabase
    .from("savings_accounts")
    .select("*, savings_interest_tiers(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error) {
    if (isMissingSavingsTableError(error)) {
      logSupabaseError("getSavingsAccounts:migration-pending", error);
      return [];
    }
    throw error;
  }

  return (data as DbSavingsAccount[]).map(mapSavingsAccount);
}

export async function getSavingsByAccountId(
  supabase: SupabaseClient,
  userId: string,
  accountId: string,
): Promise<SavingsAccount | null> {
  const { data, error } = await supabase
    .from("savings_accounts")
    .select("*, savings_interest_tiers(*)")
    .eq("account_id", accountId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    if (isMissingSavingsTableError(error)) return null;
    throw error;
  }

  if (!data) return null;
  return mapSavingsAccount(data as DbSavingsAccount);
}
