import type { SupabaseClient } from "@supabase/supabase-js";

import {
  getCreditCardByAccountId,
  getLoanByAccountId,
} from "@/lib/lending/load-lending";
import {
  mapCreditCard,
  mapLoan,
  type DbCreditCard,
  type DbLoan,
} from "@/lib/lending/mappers";
import type {
  CreateCreditCardInput,
  CreateLoanInput,
  CreditCard,
  Loan,
  UpdateCreditCardInput,
  UpdateLoanInput,
} from "@/lib/lending/types";
import { patchAccount } from "@/lib/finance/service";
import { getSupabaseErrorMessage } from "@/lib/supabase/errors";

export async function createLoan(
  supabase: SupabaseClient,
  userId: string,
  input: CreateLoanInput,
): Promise<Loan> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) throw new Error(getSupabaseErrorMessage(authError));
  if (!user || user.id !== userId) throw new Error("Not authenticated");

  const { data: accountRow, error: accountError } = await supabase
    .from("accounts")
    .insert({
      user_id: user.id,
      account_type: "loan",
      name: input.name.trim(),
      institution: input.institution?.trim() || null,
      current_balance: input.currentBalance,
      include_in_net_worth: input.includeInNetWorth ?? true,
      include_in_emergency_fund: input.includeInEmergencyFund ?? false,
      status: "active",
    })
    .select("id")
    .single();

  if (accountError) throw new Error(getSupabaseErrorMessage(accountError));

  const { data, error } = await supabase
    .from("loans")
    .insert({
      user_id: user.id,
      account_id: accountRow.id,
      loan_number_last4: input.loanNumberLast4 ?? null,
    })
    .select("*")
    .single();

  if (error) {
    await supabase.from("accounts").delete().eq("id", accountRow.id).eq("user_id", userId);
    throw new Error(getSupabaseErrorMessage(error));
  }

  return mapLoan(data as DbLoan);
}

export async function createCreditCard(
  supabase: SupabaseClient,
  userId: string,
  input: CreateCreditCardInput,
): Promise<CreditCard> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) throw new Error(getSupabaseErrorMessage(authError));
  if (!user || user.id !== userId) throw new Error("Not authenticated");

  const { data: accountRow, error: accountError } = await supabase
    .from("accounts")
    .insert({
      user_id: user.id,
      account_type: "credit_card",
      name: input.name.trim(),
      institution: input.institution?.trim() || null,
      current_balance: input.currentBalance,
      include_in_net_worth: input.includeInNetWorth ?? true,
      include_in_emergency_fund: input.includeInEmergencyFund ?? false,
      status: "active",
    })
    .select("id")
    .single();

  if (accountError) throw new Error(getSupabaseErrorMessage(accountError));

  const { data, error } = await supabase
    .from("credit_cards")
    .insert({
      user_id: user.id,
      account_id: accountRow.id,
      card_number_last4: input.cardNumberLast4 ?? null,
    })
    .select("*")
    .single();

  if (error) {
    await supabase.from("accounts").delete().eq("id", accountRow.id).eq("user_id", userId);
    throw new Error(getSupabaseErrorMessage(error));
  }

  return mapCreditCard(data as DbCreditCard);
}

export async function updateLoan(
  supabase: SupabaseClient,
  userId: string,
  accountId: string,
  input: UpdateLoanInput,
): Promise<Loan> {
  const existing = await getLoanByAccountId(supabase, userId, accountId);
  if (!existing) throw new Error("Loan not found");

  const accountPatch: Parameters<typeof patchAccount>[3] = {};
  if (input.name !== undefined) accountPatch.name = input.name;
  if (input.institution !== undefined) accountPatch.institution = input.institution;
  if (input.includeInNetWorth !== undefined) {
    accountPatch.includeInNetWorth = input.includeInNetWorth;
  }
  if (input.includeInEmergencyFund !== undefined) {
    accountPatch.includeInEmergencyFund = input.includeInEmergencyFund;
  }

  if (Object.keys(accountPatch).length > 0) {
    await patchAccount(supabase, userId, accountId, accountPatch);
  }

  if (input.loanNumberLast4 !== undefined) {
    const { data, error } = await supabase
      .from("loans")
      .update({ loan_number_last4: input.loanNumberLast4 })
      .eq("id", existing.id)
      .eq("user_id", userId)
      .select("*")
      .single();

    if (error) throw new Error(getSupabaseErrorMessage(error));
    return mapLoan(data as DbLoan);
  }

  return existing;
}

export async function updateCreditCard(
  supabase: SupabaseClient,
  userId: string,
  accountId: string,
  input: UpdateCreditCardInput,
): Promise<CreditCard> {
  const existing = await getCreditCardByAccountId(supabase, userId, accountId);
  if (!existing) throw new Error("Credit card not found");

  const accountPatch: Parameters<typeof patchAccount>[3] = {};
  if (input.name !== undefined) accountPatch.name = input.name;
  if (input.institution !== undefined) accountPatch.institution = input.institution;
  if (input.includeInNetWorth !== undefined) {
    accountPatch.includeInNetWorth = input.includeInNetWorth;
  }
  if (input.includeInEmergencyFund !== undefined) {
    accountPatch.includeInEmergencyFund = input.includeInEmergencyFund;
  }

  if (Object.keys(accountPatch).length > 0) {
    await patchAccount(supabase, userId, accountId, accountPatch);
  }

  if (input.cardNumberLast4 !== undefined) {
    const { data, error } = await supabase
      .from("credit_cards")
      .update({ card_number_last4: input.cardNumberLast4 })
      .eq("id", existing.id)
      .eq("user_id", userId)
      .select("*")
      .single();

    if (error) throw new Error(getSupabaseErrorMessage(error));
    return mapCreditCard(data as DbCreditCard);
  }

  return existing;
}
