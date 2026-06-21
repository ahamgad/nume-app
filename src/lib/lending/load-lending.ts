import type { SupabaseClient } from "@supabase/supabase-js";

import { mapLoan, type DbLoan } from "@/lib/lending/mappers";
import type { Loan } from "@/lib/lending/types";
import { logSupabaseError } from "@/lib/supabase/errors";

function isMissingLoanTableError(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;
  const record = error as Record<string, unknown>;
  if (record.code === "PGRST205") return true;
  if (typeof record.message === "string") {
    return record.message.includes("public.loans");
  }
  return false;
}

export async function getLoansSafe(
  supabase: SupabaseClient,
  userId: string,
): Promise<Loan[]> {
  const { data, error } = await supabase
    .from("loans")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error) {
    if (isMissingLoanTableError(error)) {
      logSupabaseError("getLoans:migration-pending", error);
      return [];
    }
    throw error;
  }

  return (data as DbLoan[]).map(mapLoan);
}

export async function getLoanByAccountId(
  supabase: SupabaseClient,
  userId: string,
  accountId: string,
): Promise<Loan | null> {
  const { data, error } = await supabase
    .from("loans")
    .select("*")
    .eq("account_id", accountId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    if (isMissingLoanTableError(error)) return null;
    throw error;
  }

  return data ? mapLoan(data as DbLoan) : null;
}
