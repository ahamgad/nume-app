import type { SupabaseClient } from "@supabase/supabase-js";

import {
  mapCreditCard,
  mapLoan,
  type DbCreditCard,
  type DbLoan,
} from "@/lib/lending/mappers";
import type { CreditCard, Loan } from "@/lib/lending/types";
import { logSupabaseError } from "@/lib/supabase/errors";

function isMissingLendingTableError(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;
  const record = error as Record<string, unknown>;
  if (record.code === "PGRST205") return true;
  if (typeof record.message === "string") {
    return (
      record.message.includes("public.loans") ||
      record.message.includes("public.credit_cards")
    );
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
    if (isMissingLendingTableError(error)) {
      logSupabaseError("getLoans:migration-pending", error);
      return [];
    }
    throw error;
  }

  return (data as DbLoan[]).map(mapLoan);
}

export async function getCreditCardsSafe(
  supabase: SupabaseClient,
  userId: string,
): Promise<CreditCard[]> {
  const { data, error } = await supabase
    .from("credit_cards")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error) {
    if (isMissingLendingTableError(error)) {
      logSupabaseError("getCreditCards:migration-pending", error);
      return [];
    }
    throw error;
  }

  return (data as DbCreditCard[]).map(mapCreditCard);
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
    if (isMissingLendingTableError(error)) return null;
    throw error;
  }

  return data ? mapLoan(data as DbLoan) : null;
}

export async function getCreditCardByAccountId(
  supabase: SupabaseClient,
  userId: string,
  accountId: string,
): Promise<CreditCard | null> {
  const { data, error } = await supabase
    .from("credit_cards")
    .select("*")
    .eq("account_id", accountId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    if (isMissingLendingTableError(error)) return null;
    throw error;
  }

  return data ? mapCreditCard(data as DbCreditCard) : null;
}
