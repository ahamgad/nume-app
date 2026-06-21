import type { SupabaseClient } from "@supabase/supabase-js";

import { getRelationship } from "@/lib/finance/account-relationships/service";
import type { AccountRelationshipType } from "@/lib/finance/account-relationships/types";
import { mapAccount } from "@/lib/finance/mappers";
import type { Account } from "@/lib/finance/types";

async function loadAccountById(
  supabase: SupabaseClient,
  userId: string,
  accountId: string,
): Promise<Account | null> {
  const { data, error } = await supabase
    .from("accounts")
    .select("*")
    .eq("id", accountId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return mapAccount(data);
}

async function getRelatedAccount(
  supabase: SupabaseClient,
  userId: string,
  sourceAccountId: string,
  relationshipType: AccountRelationshipType,
): Promise<Account | null> {
  const relationship = await getRelationship(
    supabase,
    userId,
    sourceAccountId,
    relationshipType,
  );
  if (!relationship) return null;

  return loadAccountById(supabase, userId, relationship.targetAccountId);
}

export async function getInterestDestinationAccount(
  supabase: SupabaseClient,
  userId: string,
  sourceAccountId: string,
): Promise<Account | null> {
  return getRelatedAccount(
    supabase,
    userId,
    sourceAccountId,
    "interest_destination",
  );
}

export async function getCreditCardPaymentSource(
  supabase: SupabaseClient,
  userId: string,
  creditCardAccountId: string,
): Promise<Account | null> {
  return getRelatedAccount(
    supabase,
    userId,
    creditCardAccountId,
    "credit_card_payment_source",
  );
}

export async function getLoanPaymentSource(
  supabase: SupabaseClient,
  userId: string,
  loanAccountId: string,
): Promise<Account | null> {
  return getRelatedAccount(
    supabase,
    userId,
    loanAccountId,
    "loan_payment_source",
  );
}
