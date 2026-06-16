import type { SupabaseClient } from "@supabase/supabase-js";

import { assertDestinationAccount } from "@/lib/finance/interest-destination-accounts";
import { getSupabaseErrorMessage } from "@/lib/supabase/errors";
import { todayIsoDate } from "@/lib/format/date";
import {
  calculateInitialNextPostingDate,
  calculateNextPostingDateAfter,
} from "@/lib/savings/posting-schedule";
import {
  getSavingsByAccountId,
  getSavingsAccountsSafe,
} from "@/lib/savings/load-savings";
import { mapSavingsAccount, type DbSavingsAccount } from "@/lib/savings/mappers";
import type {
  CreateSavingsAccountInput,
  SavingsAccount,
  UpdateSavingsAccountInput,
} from "@/lib/savings/types";

async function replaceTiers(
  supabase: SupabaseClient,
  userId: string,
  savingsAccountId: string,
  tiers: CreateSavingsAccountInput["tiers"],
): Promise<void> {
  const { error: deleteError } = await supabase
    .from("savings_interest_tiers")
    .delete()
    .eq("savings_account_id", savingsAccountId)
    .eq("user_id", userId);

  if (deleteError) throw deleteError;

  if (!tiers || tiers.length === 0) return;

  const { error: insertError } = await supabase
    .from("savings_interest_tiers")
    .insert(
      tiers.map((tier) => ({
        user_id: userId,
        savings_account_id: savingsAccountId,
        min_balance: tier.minBalance,
        max_balance: tier.maxBalance,
        annual_interest_rate: tier.annualInterestRate,
        sort_order: tier.sortOrder,
      })),
    );

  if (insertError) throw insertError;
}

export async function getSavingsAccounts(
  supabase: SupabaseClient,
  userId: string,
): Promise<SavingsAccount[]> {
  return getSavingsAccountsSafe(supabase, userId);
}

export { getSavingsByAccountId };

export async function createSavingsAccount(
  supabase: SupabaseClient,
  userId: string,
  input: CreateSavingsAccountInput,
): Promise<SavingsAccount> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    throw new Error(getSupabaseErrorMessage(authError));
  }
  if (!user || user.id !== userId) {
    throw new Error("Not authenticated");
  }

  if (input.interestDestination === "another_account") {
    await assertDestinationAccount(supabase, userId, input.destinationAccountId);
  }

  const cycleStartDate = todayIsoDate();
  const nextPostingDate = calculateInitialNextPostingDate(
    cycleStartDate,
    input.postingFrequency,
    input.postingDay,
  );

  const { data: accountRow, error: accountError } = await supabase
    .from("accounts")
    .insert({
      user_id: user.id,
      account_type: "savings_account",
      name: input.name.trim(),
      institution: input.institution?.trim() || null,
      current_balance: input.openingBalance,
      include_in_net_worth: input.includeInNetWorth ?? true,
      include_in_emergency_fund: input.includeInEmergencyFund ?? false,
      status: "active",
    })
    .select("id")
    .single();

  if (accountError) {
    throw new Error(getSupabaseErrorMessage(accountError));
  }

  const { data: savingsRow, error: savingsError } = await supabase
    .from("savings_accounts")
    .insert({
      user_id: user.id,
      account_id: accountRow.id,
      interest_model: input.interestModel,
      annual_interest_rate:
        input.interestModel === "fixed" ? input.annualInterestRate : null,
      posting_frequency: input.postingFrequency,
      posting_day: input.postingDay,
      interest_destination: input.interestDestination,
      destination_account_id:
        input.interestDestination === "another_account"
          ? input.destinationAccountId
          : null,
      cycle_start_date: cycleStartDate,
      cycle_minimum_balance: input.openingBalance,
      next_posting_date: nextPostingDate,
    })
    .select("*")
    .single();

  if (savingsError) {
    await supabase.from("accounts").delete().eq("id", accountRow.id);
    throw new Error(getSupabaseErrorMessage(savingsError));
  }

  if (input.interestModel === "tiered" && input.tiers?.length) {
    await replaceTiers(supabase, userId, savingsRow.id, input.tiers);
  }

  const created = await getSavingsByAccountId(
    supabase,
    userId,
    accountRow.id,
  );
  if (!created) throw new Error("Savings account not found after create");
  return created;
}

export async function updateSavingsAccount(
  supabase: SupabaseClient,
  userId: string,
  savingsAccountId: string,
  input: UpdateSavingsAccountInput,
): Promise<SavingsAccount> {
  const { data: savingsMeta, error: metaError } = await supabase
    .from("savings_accounts")
    .select("account_id")
    .eq("id", savingsAccountId)
    .eq("user_id", userId)
    .single();

  if (metaError) throw metaError;

  const accountId = savingsMeta.account_id;
  const existing = await getSavingsByAccountId(supabase, userId, accountId);
  if (!existing) throw new Error("Savings account not found");

  if (input.name !== undefined || input.institution !== undefined) {
    const accountPatch: Record<string, unknown> = {};
    if (input.name !== undefined) accountPatch.name = input.name.trim();
    if (input.institution !== undefined) {
      accountPatch.institution = input.institution?.trim() || null;
    }
    const { error } = await supabase
      .from("accounts")
      .update(accountPatch)
      .eq("id", accountId)
      .eq("user_id", userId);
    if (error) throw error;
  }

  const destination =
    input.interestDestination ??
    existing?.interestDestination ??
    "same_account";
  const destinationAccountId =
    input.destinationAccountId ??
    existing?.destinationAccountId ??
    null;

  if (destination === "another_account") {
    await assertDestinationAccount(
      supabase,
      userId,
      destinationAccountId,
      { excludeAccountId: accountId },
    );
  }

  const savingsPatch: Record<string, unknown> = {};
  if (input.interestModel !== undefined) {
    savingsPatch.interest_model = input.interestModel;
  }
  if (input.annualInterestRate !== undefined) {
    savingsPatch.annual_interest_rate = input.annualInterestRate;
  }
  if (input.postingFrequency !== undefined) {
    savingsPatch.posting_frequency = input.postingFrequency;
  }
  if (input.postingDay !== undefined) {
    savingsPatch.posting_day = input.postingDay;
  }
  if (input.interestDestination !== undefined) {
    savingsPatch.interest_destination = input.interestDestination;
  }
  if (
    input.destinationAccountId !== undefined ||
    input.interestDestination !== undefined
  ) {
    savingsPatch.destination_account_id =
      destination === "another_account" ? destinationAccountId : null;
  }

  if (
    input.postingFrequency !== undefined ||
    input.postingDay !== undefined
  ) {
    const frequency =
      input.postingFrequency ?? existing.postingFrequency;
    const postingDay = input.postingDay ?? existing.postingDay;
    savingsPatch.next_posting_date = calculateInitialNextPostingDate(
      existing.cycleStartDate,
      frequency,
      postingDay,
    );
  }

  if (Object.keys(savingsPatch).length > 0) {
    const { error } = await supabase
      .from("savings_accounts")
      .update(savingsPatch)
      .eq("id", savingsAccountId)
      .eq("user_id", userId);
    if (error) throw error;
  }

  if (input.tiers !== undefined) {
    await replaceTiers(supabase, userId, savingsAccountId, input.tiers);
  }

  const updated = await supabase
    .from("savings_accounts")
    .select("*, savings_interest_tiers(*)")
    .eq("id", savingsAccountId)
    .eq("user_id", userId)
    .single();

  if (updated.error) throw updated.error;
  return mapSavingsAccount(updated.data as DbSavingsAccount);
}

export async function updateSavingsCycleMinimum(
  supabase: SupabaseClient,
  userId: string,
  accountId: string,
  newBalance: number,
): Promise<void> {
  const savings = await getSavingsByAccountId(supabase, userId, accountId);
  if (!savings) return;

  const nextMinimum = Math.min(savings.cycleMinimumBalance, newBalance);
  if (nextMinimum === savings.cycleMinimumBalance) return;

  const { error } = await supabase
    .from("savings_accounts")
    .update({ cycle_minimum_balance: nextMinimum })
    .eq("id", savings.id)
    .eq("user_id", userId);

  if (error) throw error;
}

export async function resetSavingsCycleAfterPosting(
  supabase: SupabaseClient,
  userId: string,
  savingsAccountId: string,
  postingDate: string,
  currentBalance: number,
  frequency: CreateSavingsAccountInput["postingFrequency"],
  postingDay: number,
): Promise<void> {
  const nextPostingDate = calculateNextPostingDateAfter(
    postingDate,
    frequency,
    postingDay,
  );

  const { error } = await supabase
    .from("savings_accounts")
    .update({
      cycle_start_date: postingDate,
      cycle_minimum_balance: currentBalance,
      next_posting_date: nextPostingDate,
      last_posting_processed_at: new Date().toISOString(),
    })
    .eq("id", savingsAccountId)
    .eq("user_id", userId);

  if (error) throw error;
}
