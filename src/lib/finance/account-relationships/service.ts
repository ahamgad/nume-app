import type { SupabaseClient } from "@supabase/supabase-js";

import {
  clearInterestDestinationRelationship,
  readInterestDestinationRelationship,
  writeInterestDestinationRelationship,
} from "@/lib/finance/account-relationships/adapters/interest-destination";
import { mapAccountRelationship } from "@/lib/finance/account-relationships/mappers";
import type {
  AccountRelationship,
  AccountRelationshipType,
  DbAccountRelationship,
} from "@/lib/finance/account-relationships/types";
import { isTableBackedRelationshipType } from "@/lib/finance/account-relationships/types";
import {
  validateRelationshipAccounts,
  type RelationshipAccountSnapshot,
} from "@/lib/finance/account-relationships/validation";
import { assertDestinationAccount } from "@/lib/finance/interest-destination-accounts";

async function loadAccountSnapshot(
  supabase: SupabaseClient,
  userId: string,
  accountId: string,
): Promise<RelationshipAccountSnapshot | null> {
  const { data, error } = await supabase
    .from("accounts")
    .select("id, account_type, status")
    .eq("id", accountId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    id: data.id,
    type: data.account_type,
    status: data.status,
  };
}

async function validateRelationshipPair(
  supabase: SupabaseClient,
  userId: string,
  sourceAccountId: string,
  targetAccountId: string,
  relationshipType: AccountRelationshipType,
): Promise<void> {
  const source = await loadAccountSnapshot(supabase, userId, sourceAccountId);
  const target = await loadAccountSnapshot(supabase, userId, targetAccountId);

  if (!source) throw new Error("Source account not found");
  if (!target) throw new Error("Target account not found");

  validateRelationshipAccounts(source, target, relationshipType);

  await assertDestinationAccount(supabase, userId, targetAccountId, {
    excludeAccountId: sourceAccountId,
  });
}

async function getTableBackedRelationship(
  supabase: SupabaseClient,
  userId: string,
  sourceAccountId: string,
  relationshipType: AccountRelationshipType,
): Promise<AccountRelationship | null> {
  const { data, error } = await supabase
    .from("account_relationships")
    .select("*")
    .eq("user_id", userId)
    .eq("source_account_id", sourceAccountId)
    .eq("relationship_type", relationshipType)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return mapAccountRelationship(data as DbAccountRelationship);
}

async function upsertTableBackedRelationship(
  supabase: SupabaseClient,
  userId: string,
  sourceAccountId: string,
  targetAccountId: string,
  relationshipType: AccountRelationshipType,
): Promise<AccountRelationship> {
  const existing = await getTableBackedRelationship(
    supabase,
    userId,
    sourceAccountId,
    relationshipType,
  );

  if (existing) {
    const { data, error } = await supabase
      .from("account_relationships")
      .update({ target_account_id: targetAccountId })
      .eq("id", existing.id)
      .eq("user_id", userId)
      .select("*")
      .single();

    if (error) throw error;
    return mapAccountRelationship(data as DbAccountRelationship);
  }

  const { data, error } = await supabase
    .from("account_relationships")
    .insert({
      user_id: userId,
      source_account_id: sourceAccountId,
      target_account_id: targetAccountId,
      relationship_type: relationshipType,
    })
    .select("*")
    .single();

  if (error) throw error;
  return mapAccountRelationship(data as DbAccountRelationship);
}

async function deleteTableBackedRelationship(
  supabase: SupabaseClient,
  userId: string,
  sourceAccountId: string,
  relationshipType: AccountRelationshipType,
): Promise<void> {
  const { error } = await supabase
    .from("account_relationships")
    .delete()
    .eq("user_id", userId)
    .eq("source_account_id", sourceAccountId)
    .eq("relationship_type", relationshipType);

  if (error) throw error;
}

export async function getRelationship(
  supabase: SupabaseClient,
  userId: string,
  sourceAccountId: string,
  relationshipType: AccountRelationshipType,
): Promise<AccountRelationship | null> {
  if (relationshipType === "interest_destination") {
    return readInterestDestinationRelationship(
      supabase,
      userId,
      sourceAccountId,
    );
  }

  if (!isTableBackedRelationshipType(relationshipType)) {
    return null;
  }

  return getTableBackedRelationship(
    supabase,
    userId,
    sourceAccountId,
    relationshipType,
  );
}

export async function setRelationship(
  supabase: SupabaseClient,
  userId: string,
  sourceAccountId: string,
  targetAccountId: string,
  relationshipType: AccountRelationshipType,
): Promise<AccountRelationship> {
  await validateRelationshipPair(
    supabase,
    userId,
    sourceAccountId,
    targetAccountId,
    relationshipType,
  );

  if (relationshipType === "interest_destination") {
    return writeInterestDestinationRelationship(
      supabase,
      userId,
      sourceAccountId,
      targetAccountId,
    );
  }

  return upsertTableBackedRelationship(
    supabase,
    userId,
    sourceAccountId,
    targetAccountId,
    relationshipType,
  );
}

export async function removeRelationship(
  supabase: SupabaseClient,
  userId: string,
  sourceAccountId: string,
  relationshipType: AccountRelationshipType,
): Promise<void> {
  if (relationshipType === "interest_destination") {
    await clearInterestDestinationRelationship(
      supabase,
      userId,
      sourceAccountId,
    );
    return;
  }

  await deleteTableBackedRelationship(
    supabase,
    userId,
    sourceAccountId,
    relationshipType,
  );
}
