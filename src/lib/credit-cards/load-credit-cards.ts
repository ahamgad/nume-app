import type { SupabaseClient } from "@supabase/supabase-js";

import { mapCreditCard, type DbCreditCard } from "@/lib/credit-cards/mappers";
import type { CreditCard } from "@/lib/credit-cards/types";
import { logSupabaseError } from "@/lib/supabase/errors";

function isMissingCreditCardTableError(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;
  const record = error as Record<string, unknown>;
  if (record.code === "PGRST205") return true;
  if (typeof record.message === "string") {
    return record.message.includes("public.credit_cards");
  }
  return false;
}

function isMissingCreditCardColumnError(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;
  const record = error as Record<string, unknown>;
  if (typeof record.message !== "string") return false;
  return (
    record.message.includes("statement_close_day") ||
    record.message.includes("credit_limit")
  );
}

async function loadPaymentSourceByAccountId(
  supabase: SupabaseClient,
  userId: string,
): Promise<Map<string, string>> {
  const { data, error } = await supabase
    .from("account_relationships")
    .select("source_account_id, target_account_id")
    .eq("user_id", userId)
    .eq("relationship_type", "credit_card_payment_source");

  if (error) {
    if (error.code === "PGRST205") return new Map();
    throw error;
  }

  return new Map(
    (data ?? []).map((row) => [
      row.source_account_id as string,
      row.target_account_id as string,
    ]),
  );
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
    if (isMissingCreditCardTableError(error)) {
      logSupabaseError("getCreditCards:migration-pending", error);
      return [];
    }
    if (isMissingCreditCardColumnError(error)) {
      logSupabaseError("getCreditCards:columns-pending", error);
      return [];
    }
    throw error;
  }

  let paymentSources = new Map<string, string>();
  try {
    paymentSources = await loadPaymentSourceByAccountId(supabase, userId);
  } catch (relationshipError) {
    logSupabaseError("getCreditCards:payment-sources", relationshipError);
  }

  return (data as DbCreditCard[]).map((row) =>
    mapCreditCard(row, paymentSources.get(row.account_id) ?? null),
  );
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
    if (isMissingCreditCardTableError(error)) return null;
    if (isMissingCreditCardColumnError(error)) return null;
    throw error;
  }

  if (!data) return null;

  let paymentSourceAccountId: string | null = null;
  try {
    const { data: relationship, error: relationshipError } = await supabase
      .from("account_relationships")
      .select("target_account_id")
      .eq("user_id", userId)
      .eq("source_account_id", accountId)
      .eq("relationship_type", "credit_card_payment_source")
      .maybeSingle();

    if (relationshipError && relationshipError.code !== "PGRST205") {
      throw relationshipError;
    }
    paymentSourceAccountId =
      (relationship?.target_account_id as string | undefined) ?? null;
  } catch (relationshipError) {
    logSupabaseError("getCreditCardByAccountId:payment-source", relationshipError);
  }

  return mapCreditCard(data as DbCreditCard, paymentSourceAccountId);
}
