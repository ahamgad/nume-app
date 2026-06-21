import type { SupabaseClient } from "@supabase/supabase-js";

import { canReceiveTransfers, canSendTransfers } from "@/lib/finance/account-capabilities";
import { mapAccount, mapRecord, type DbAccount, type DbRecord } from "@/lib/finance/mappers";
import { getSupabaseErrorMessage } from "@/lib/supabase/errors";
import { updateSavingsCycleMinimum } from "@/lib/savings/service";
import type {
  Account,
  CreateAccountInput,
  CreateRecordInput,
  CreateTransferInput,
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
    .in("status", ["active", "archived"])
    .order("created_at", { ascending: false });

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
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    throw new Error(getSupabaseErrorMessage(authError));
  }

  if (!user) {
    throw new Error("Not authenticated — session unavailable for account insert");
  }

  const { data, error } = await supabase
    .from("accounts")
    .insert({
      user_id: user.id,
      account_type: input.type ?? "current_account",
      name: input.name.trim(),
      institution: input.institution?.trim() || null,
      account_number_last4: input.accountNumberLast4 ?? null,
      current_balance: input.currentBalance,
      include_in_net_worth: input.includeInNetWorth ?? true,
      include_in_emergency_fund: input.includeInEmergencyFund ?? false,
      status: "active",
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(getSupabaseErrorMessage(error));
  }

  if (user.id !== userId) {
    throw new Error("Session user mismatch — please sign in again");
  }

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
      | "accountNumberLast4"
      | "includeInNetWorth"
      | "includeInEmergencyFund"
      | "currentBalance"
    >
  >,
): Promise<void> {
  const payload: Record<string, unknown> = {};
  if (patch.name !== undefined) payload.name = patch.name;
  if (patch.institution !== undefined) payload.institution = patch.institution;
  if (patch.accountNumberLast4 !== undefined) {
    payload.account_number_last4 = patch.accountNumberLast4;
  }
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

  if (patch.currentBalance !== undefined) {
    await updateSavingsCycleMinimum(
      supabase,
      userId,
      id,
      patch.currentBalance,
    );
  }
}

export async function archiveAccount(
  supabase: SupabaseClient,
  userId: string,
  id: string,
): Promise<void> {
  const { error } = await supabase
    .from("accounts")
    .update({
      status: "archived",
      include_in_net_worth: false,
    })
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    throw new Error(getSupabaseErrorMessage(error));
  }
}

export async function restoreAccount(
  supabase: SupabaseClient,
  userId: string,
  id: string,
): Promise<void> {
  const { error } = await supabase
    .from("accounts")
    .update({ status: "active" })
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    throw new Error(getSupabaseErrorMessage(error));
  }
}

/** @deprecated v1 — use archiveAccount. Hard delete retained for internal cleanup only. */
export async function deleteAccount(
  supabase: SupabaseClient,
  userId: string,
  id: string,
): Promise<void> {
  const { error } = await supabase
    .from("accounts")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    throw new Error(getSupabaseErrorMessage(error));
  }
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

  await updateSavingsCycleMinimum(
    supabase,
    userId,
    input.accountId,
    nextBalance,
  );

  return {
    record: mapRecord(recordRow as DbRecord),
    nextBalance,
  };
}

export async function insertTransfer(
  supabase: SupabaseClient,
  userId: string,
  input: CreateTransferInput,
  fromAccount: Account,
  toAccount: Account,
): Promise<{ fromRecord: FinanceRecord; toRecord: FinanceRecord }> {
  if (input.fromAccountId === input.toAccountId) {
    throw new Error("Transfer source and destination must differ");
  }
  if (!canSendTransfers(fromAccount)) {
    throw new Error("Source account cannot send transfers");
  }
  if (!canReceiveTransfers(toAccount)) {
    throw new Error("Destination account cannot receive transfers");
  }
  if (input.amount <= 0) {
    throw new Error("Transfer amount must be greater than zero");
  }

  const description = input.description?.trim() || null;
  const fromNextBalance = fromAccount.currentBalance - input.amount;
  const toNextBalance = toAccount.currentBalance + input.amount;

  const { data: fromRecordRow, error: fromRecordError } = await supabase
    .from("records")
    .insert({
      user_id: userId,
      account_id: input.fromAccountId,
      record_type: "transfer",
      amount: -input.amount,
      description,
      record_date: input.date,
    })
    .select("*")
    .single();

  if (fromRecordError) throw fromRecordError;

  const { error: fromBalanceError } = await supabase
    .from("accounts")
    .update({ current_balance: fromNextBalance })
    .eq("id", input.fromAccountId)
    .eq("user_id", userId);

  if (fromBalanceError) throw fromBalanceError;

  await updateSavingsCycleMinimum(
    supabase,
    userId,
    input.fromAccountId,
    fromNextBalance,
  );

  const { data: toRecordRow, error: toRecordError } = await supabase
    .from("records")
    .insert({
      user_id: userId,
      account_id: input.toAccountId,
      record_type: "transfer",
      amount: input.amount,
      description,
      record_date: input.date,
    })
    .select("*")
    .single();

  if (toRecordError) {
    throw toRecordError;
  }

  const { error: toBalanceError } = await supabase
    .from("accounts")
    .update({ current_balance: toNextBalance })
    .eq("id", input.toAccountId)
    .eq("user_id", userId);

  if (toBalanceError) throw toBalanceError;

  await updateSavingsCycleMinimum(
    supabase,
    userId,
    input.toAccountId,
    toNextBalance,
  );

  return {
    fromRecord: mapRecord(fromRecordRow as DbRecord),
    toRecord: mapRecord(toRecordRow as DbRecord),
  };
}

export interface InsertInterestRecordInput {
  accountId: string;
  amount: number;
  date: string;
  description?: string | null;
  certificateId: string;
  scheduleEntryId: string;
  /** When true, credits the destination account balance. */
  updateBalance: boolean;
  currentBalance?: number;
}

export async function insertInterestRecord(
  supabase: SupabaseClient,
  userId: string,
  input: InsertInterestRecordInput,
): Promise<{ record: FinanceRecord; nextBalance?: number }> {
  if (input.amount <= 0) {
    throw new Error("Interest amount must be greater than zero");
  }

  const description = input.description?.trim() || "Certificate Interest";

  const { data: recordRow, error: recordError } = await supabase
    .from("records")
    .insert({
      user_id: userId,
      account_id: input.accountId,
      record_type: "interest",
      amount: input.amount,
      description,
      record_date: input.date,
      certificate_id: input.certificateId,
      schedule_entry_id: input.scheduleEntryId,
    })
    .select("*")
    .single();

  if (recordError) throw recordError;

  if (!input.updateBalance) {
    return { record: mapRecord(recordRow as DbRecord) };
  }

  const currentBalance = input.currentBalance ?? 0;
  const nextBalance = currentBalance + input.amount;

  const { error: accountError } = await supabase
    .from("accounts")
    .update({ current_balance: nextBalance })
    .eq("id", input.accountId)
    .eq("user_id", userId);

  if (accountError) throw accountError;

  await updateSavingsCycleMinimum(
    supabase,
    userId,
    input.accountId,
    nextBalance,
  );

  return {
    record: mapRecord(recordRow as DbRecord),
    nextBalance,
  };
}

export interface InsertSavingsInterestRecordInput {
  accountId: string;
  amount: number;
  date: string;
  description?: string | null;
  savingsAccountId: string;
  updateBalance: boolean;
  currentBalance?: number;
}

export async function insertSavingsInterestRecord(
  supabase: SupabaseClient,
  userId: string,
  input: InsertSavingsInterestRecordInput,
): Promise<{ record: FinanceRecord; nextBalance?: number }> {
  if (input.amount <= 0) {
    throw new Error("Interest amount must be greater than zero");
  }

  const description = input.description?.trim() || "Interest Credit";

  const { data: recordRow, error: recordError } = await supabase
    .from("records")
    .insert({
      user_id: userId,
      account_id: input.accountId,
      record_type: "interest",
      amount: input.amount,
      description,
      record_date: input.date,
      savings_account_id: input.savingsAccountId,
    })
    .select("*")
    .single();

  if (recordError) throw recordError;

  if (!input.updateBalance) {
    return { record: mapRecord(recordRow as DbRecord) };
  }

  const currentBalance = input.currentBalance ?? 0;
  const nextBalance = currentBalance + input.amount;

  const { error: accountError } = await supabase
    .from("accounts")
    .update({ current_balance: nextBalance })
    .eq("id", input.accountId)
    .eq("user_id", userId);

  if (accountError) throw accountError;

  await updateSavingsCycleMinimum(
    supabase,
    userId,
    input.accountId,
    nextBalance,
  );

  return {
    record: mapRecord(recordRow as DbRecord),
    nextBalance,
  };
}
