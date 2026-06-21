import type { SupabaseClient } from "@supabase/supabase-js";

import {
  legacyInterestRelationshipId,
} from "@/lib/finance/account-relationships/mappers";
import type { AccountRelationship } from "@/lib/finance/account-relationships/types";
import { getCertificateByAccountId } from "@/lib/certificates/service";
import { getSavingsByAccountId } from "@/lib/savings/load-savings";

interface SourceAccountRow {
  account_type: string;
}

/**
 * Reads interest destination from legacy savings/certificate columns.
 * Savings `same_account` yields null (no cross-account link).
 */
export async function readInterestDestinationRelationship(
  supabase: SupabaseClient,
  userId: string,
  sourceAccountId: string,
): Promise<AccountRelationship | null> {
  const { data: sourceAccount, error: sourceError } = await supabase
    .from("accounts")
    .select("account_type")
    .eq("id", sourceAccountId)
    .eq("user_id", userId)
    .maybeSingle();

  if (sourceError) throw sourceError;
  if (!sourceAccount) return null;

  const accountType = (sourceAccount as SourceAccountRow).account_type;

  if (accountType === "savings_account") {
    const savings = await getSavingsByAccountId(
      supabase,
      userId,
      sourceAccountId,
    );
    if (
      !savings ||
      savings.interestDestination !== "another_account" ||
      !savings.destinationAccountId
    ) {
      return null;
    }

    return {
      id: legacyInterestRelationshipId(sourceAccountId),
      userId,
      sourceAccountId,
      targetAccountId: savings.destinationAccountId,
      relationshipType: "interest_destination",
      createdAt: savings.createdAt,
    };
  }

  if (accountType === "certificate") {
    const certificate = await getCertificateByAccountId(
      supabase,
      userId,
      sourceAccountId,
    );
    if (!certificate?.destinationAccountId) {
      return null;
    }

    return {
      id: legacyInterestRelationshipId(sourceAccountId),
      userId,
      sourceAccountId,
      targetAccountId: certificate.destinationAccountId,
      relationshipType: "interest_destination",
      createdAt: certificate.createdAt,
    };
  }

  return null;
}

/** Writes interest destination to legacy extension columns (no table row). */
export async function writeInterestDestinationRelationship(
  supabase: SupabaseClient,
  userId: string,
  sourceAccountId: string,
  targetAccountId: string,
): Promise<AccountRelationship> {
  const { data: sourceAccount, error: sourceError } = await supabase
    .from("accounts")
    .select("account_type")
    .eq("id", sourceAccountId)
    .eq("user_id", userId)
    .maybeSingle();

  if (sourceError) throw sourceError;
  if (!sourceAccount) {
    throw new Error("Source account not found");
  }

  const accountType = (sourceAccount as SourceAccountRow).account_type;

  if (accountType === "savings_account") {
    const { data, error } = await supabase
      .from("savings_accounts")
      .update({
        interest_destination: "another_account",
        destination_account_id: targetAccountId,
      })
      .eq("account_id", sourceAccountId)
      .eq("user_id", userId)
      .select("created_at")
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error("Savings account not found");

    return {
      id: legacyInterestRelationshipId(sourceAccountId),
      userId,
      sourceAccountId,
      targetAccountId,
      relationshipType: "interest_destination",
      createdAt: data.created_at as string,
    };
  }

  if (accountType === "certificate") {
    const { data, error } = await supabase
      .from("certificates")
      .update({ destination_account_id: targetAccountId })
      .eq("account_id", sourceAccountId)
      .eq("user_id", userId)
      .select("created_at")
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error("Certificate not found");

    return {
      id: legacyInterestRelationshipId(sourceAccountId),
      userId,
      sourceAccountId,
      targetAccountId,
      relationshipType: "interest_destination",
      createdAt: data.created_at as string,
    };
  }

  throw new Error("Source account type cannot configure interest destination");
}

/** Clears cross-account interest destination on legacy extension columns. */
export async function clearInterestDestinationRelationship(
  supabase: SupabaseClient,
  userId: string,
  sourceAccountId: string,
): Promise<void> {
  const { data: sourceAccount, error: sourceError } = await supabase
    .from("accounts")
    .select("account_type")
    .eq("id", sourceAccountId)
    .eq("user_id", userId)
    .maybeSingle();

  if (sourceError) throw sourceError;
  if (!sourceAccount) return;

  const accountType = (sourceAccount as SourceAccountRow).account_type;

  if (accountType === "savings_account") {
    const { error } = await supabase
      .from("savings_accounts")
      .update({
        interest_destination: "same_account",
        destination_account_id: null,
      })
      .eq("account_id", sourceAccountId)
      .eq("user_id", userId);

    if (error) throw error;
    return;
  }

  if (accountType === "certificate") {
    const { error } = await supabase
      .from("certificates")
      .update({ destination_account_id: null })
      .eq("account_id", sourceAccountId)
      .eq("user_id", userId);

    if (error) throw error;
  }
}
