import type { SupabaseClient } from "@supabase/supabase-js";

import { mapAccount, mapRecord, type DbAccount, type DbRecord } from "@/lib/finance/mappers";
import type {
  Account,
  CreateAccountInput,
  CreateRecordInput,
  FinanceRecord,
} from "@/lib/finance/types";

export async function fetchAccounts(
  supabase: SupabaseClient,
  userId: string,
): Promise<Account[]> {
  const { data, error } = await supabase
    .from("accounts")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "active")
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data as DbAccount[]).map(mapAccount);
}

export async function fetchRecords(
  supabase: SupabaseClient,
  userId: string,
): Promise<FinanceRecord[]> {
  const { data, error } = await supabase
    .from("records")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data as DbRecord[]).map(mapRecord);
}

export async function insertAccount(
  supabase: SupabaseClient,
  userId: string,
  input: CreateAccountInput,
): Promise<Account> {
  const { data, error } = await supabase
    .from("accounts")
    .insert({
      user_id: userId,
      account_type: input.type ?? "current_account",
      name: input.name.trim(),
      institution: input.institution?.trim() || null,
      current_balance: input.currentBalance,
      include_in_net_worth: input.includeInNetWorth ?? true,
      include_in_emergency_fund: input.includeInEmergencyFund ?? false,
      status: "active",
    })
    .select("*")
    .single();

  if (error) throw error;
  return mapAccount(data as DbAccount);
}

export async function patchAccount(
  supabase: SupabaseClient,
  userId: string,
  id: string,
  patch: Partial<
    Pick<
      Account,
      | "name"
      | "institution"
      | "includeInNetWorth"
      | "includeInEmergencyFund"
      | "currentBalance"
    >
  >,
): Promise<void> {
  const payload: Record<string, unknown> = {};
  if (patch.name !== undefined) payload.name = patch.name;
  if (patch.institution !== undefined) payload.institution = patch.institution;
  if (patch.includeInNetWorth !== undefined) {
    payload.include_in_net_worth = patch.includeInNetWorth;
  }
  if (patch.includeInEmergencyFund !== undefined) {
    payload.include_in_emergency_fund = patch.includeInEmergencyFund;
  }
  if (patch.currentBalance !== undefined) {
    payload.current_balance = patch.currentBalance;
  }

  const { error } = await supabase
    .from("accounts")
    .update(payload)
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw error;
}

export async function insertRecordWithBalanceUpdate(
  supabase: SupabaseClient,
  userId: string,
  input: CreateRecordInput,
  currentBalance: number,
): Promise<{ record: FinanceRecord; nextBalance: number }> {
  let nextBalance = currentBalance;
  let recordAmount = input.amount;

  if (input.type === "income") {
    nextBalance += input.amount;
  } else if (input.type === "expense") {
    nextBalance -= input.amount;
  } else {
    const delta = input.amount - currentBalance;
    nextBalance = input.amount;
    recordAmount = delta;
  }

  const { data: recordRow, error: recordError } = await supabase
    .from("records")
    .insert({
      user_id: userId,
      account_id: input.accountId,
      record_type: input.type,
      amount: recordAmount,
      description: input.description?.trim() || null,
      record_date: input.date,
    })
    .select("*")
    .single();

  if (recordError) throw recordError;

  const { error: accountError } = await supabase
    .from("accounts")
    .update({ current_balance: nextBalance })
    .eq("id", input.accountId)
    .eq("user_id", userId);

  if (accountError) throw accountError;

  return {
    record: mapRecord(recordRow as DbRecord),
    nextBalance,
  };
}
