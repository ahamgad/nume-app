import type { SupabaseClient } from "@supabase/supabase-js";

import {
  applyCreditCardPayment,
  applyCreditCardPurchase,
  toStoredCreditCardBalance,
} from "@/lib/credit-cards/balance";
import { getCreditCardByAccountId } from "@/lib/credit-cards/load-credit-cards";
import { mapCreditCard, type DbCreditCard } from "@/lib/credit-cards/mappers";
import type {
  AddCreditCardPurchaseInput,
  CreateCreditCardInput,
  CreditCard,
  MakeCreditCardPaymentInput,
  UpdateCreditCardInput,
} from "@/lib/credit-cards/types";
import {
  removeRelationship,
  setRelationship,
} from "@/lib/finance/account-relationships/service";
import { canSendTransfers } from "@/lib/finance/account-capabilities";
import { mapAccount, mapRecord, type DbAccount, type DbRecord } from "@/lib/finance/mappers";
import { patchAccount } from "@/lib/finance/service";
import type { Account, FinanceRecord } from "@/lib/finance/types";
import { updateSavingsCycleMinimum } from "@/lib/savings/service";
import { getSupabaseErrorMessage } from "@/lib/supabase/errors";

function validatePaymentDueDay(day: number, field: string): void {
  if (!Number.isInteger(day) || day < 0 || day > 28) {
    throw new Error(`${field} must be between 1 and 28, or last day of month`);
  }
}

async function loadAccount(
  supabase: SupabaseClient,
  userId: string,
  accountId: string,
): Promise<Account> {
  const { data, error } = await supabase
    .from("accounts")
    .select("*")
    .eq("id", accountId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error("Account not found");
  return mapAccount(data as DbAccount);
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

  const paymentDueDay = input.paymentDueDay ?? 15;
  validatePaymentDueDay(paymentDueDay, "Statement due day");

  const linkedAccount = await loadAccount(
    supabase,
    userId,
    input.linkedAccountId,
  );
  if (!canSendTransfers(linkedAccount)) {
    throw new Error("Linked account cannot be used for credit card payments");
  }

  const { data: accountRow, error: accountError } = await supabase
    .from("accounts")
    .insert({
      user_id: user.id,
      account_type: "credit_card",
      name: input.name.trim(),
      institution: linkedAccount.institution,
      current_balance: toStoredCreditCardBalance(input.outstandingBalance),
      include_in_net_worth: true,
      include_in_emergency_fund: false,
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
      statement_close_day: 1,
      payment_due_day: paymentDueDay,
      credit_limit: input.creditLimit,
    })
    .select("*")
    .single();

  if (error) {
    await supabase
      .from("accounts")
      .delete()
      .eq("id", accountRow.id)
      .eq("user_id", userId);
    throw new Error(getSupabaseErrorMessage(error));
  }

  await setRelationship(
    supabase,
    userId,
    accountRow.id,
    input.linkedAccountId,
    "credit_card_payment_source",
  );

  return mapCreditCard(data as DbCreditCard, input.linkedAccountId);
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

  if (input.linkedAccountId) {
    const linkedAccount = await loadAccount(
      supabase,
      userId,
      input.linkedAccountId,
    );
    if (!canSendTransfers(linkedAccount)) {
      throw new Error("Linked account cannot be used for credit card payments");
    }
    accountPatch.institution = linkedAccount.institution;
  }

  if (Object.keys(accountPatch).length > 0) {
    await patchAccount(supabase, userId, accountId, accountPatch);
  }

  const cardPatch: Record<string, unknown> = {};
  if (input.cardNumberLast4 !== undefined) {
    cardPatch.card_number_last4 = input.cardNumberLast4;
  }
  if (input.paymentDueDay !== undefined) {
    validatePaymentDueDay(input.paymentDueDay, "Statement due day");
    cardPatch.payment_due_day = input.paymentDueDay;
  }
  if (input.creditLimit !== undefined) {
    cardPatch.credit_limit = input.creditLimit;
  }

  let updatedRow = existing;
  if (Object.keys(cardPatch).length > 0) {
    const { data, error } = await supabase
      .from("credit_cards")
      .update(cardPatch)
      .eq("id", existing.id)
      .eq("user_id", userId)
      .select("*")
      .single();

    if (error) throw new Error(getSupabaseErrorMessage(error));
    updatedRow = mapCreditCard(
      data as DbCreditCard,
      existing.paymentSourceAccountId,
    );
  }

  if (input.clearLinkedAccount) {
    await removeRelationship(
      supabase,
      userId,
      accountId,
      "credit_card_payment_source",
    );
    updatedRow = {
      ...updatedRow,
      paymentSourceAccountId: null,
    };
  } else if (input.linkedAccountId) {
    await setRelationship(
      supabase,
      userId,
      accountId,
      input.linkedAccountId,
      "credit_card_payment_source",
    );
    updatedRow = {
      ...updatedRow,
      paymentSourceAccountId: input.linkedAccountId,
    };
  }

  return updatedRow;
}

export async function addCreditCardPurchase(
  supabase: SupabaseClient,
  userId: string,
  accountId: string,
  input: AddCreditCardPurchaseInput,
): Promise<{ record: FinanceRecord; nextBalance: number }> {
  if (input.amount <= 0) {
    throw new Error("Purchase amount must be greater than zero");
  }

  const account = await loadAccount(supabase, userId, accountId);
  if (account.type !== "credit_card") {
    throw new Error("Account is not a credit card");
  }
  if (account.status !== "active") {
    throw new Error("Credit card must be active");
  }

  const creditCard = await getCreditCardByAccountId(supabase, userId, accountId);
  if (!creditCard) throw new Error("Credit card not found");

  const nextBalance = applyCreditCardPurchase(
    account.currentBalance,
    input.amount,
  );

  const { data: recordRow, error: recordError } = await supabase
    .from("records")
    .insert({
      user_id: userId,
      account_id: accountId,
      record_type: "credit_card_purchase",
      amount: input.amount,
      description: input.description?.trim() || null,
      record_date: input.date,
      credit_card_id: creditCard.id,
    })
    .select("*")
    .single();

  if (recordError) throw recordError;

  const { error: accountError } = await supabase
    .from("accounts")
    .update({ current_balance: nextBalance })
    .eq("id", accountId)
    .eq("user_id", userId);

  if (accountError) throw accountError;

  return {
    record: mapRecord(recordRow as DbRecord),
    nextBalance,
  };
}

export async function makeCreditCardPayment(
  supabase: SupabaseClient,
  userId: string,
  accountId: string,
  input: MakeCreditCardPaymentInput,
): Promise<{ record: FinanceRecord; nextBalance: number }> {
  if (input.amount <= 0) {
    throw new Error("Payment amount must be greater than zero");
  }

  const account = await loadAccount(supabase, userId, accountId);
  if (account.type !== "credit_card") {
    throw new Error("Account is not a credit card");
  }
  if (account.status !== "active") {
    throw new Error("Credit card must be active");
  }

  const creditCard = await getCreditCardByAccountId(supabase, userId, accountId);
  if (!creditCard) throw new Error("Credit card not found");

  const sourceAccount = await loadAccount(
    supabase,
    userId,
    input.paymentSourceAccountId,
  );
  if (!canSendTransfers(sourceAccount)) {
    throw new Error("Payment source account cannot send transfers");
  }

  const nextCreditCardBalance = applyCreditCardPayment(
    account.currentBalance,
    input.amount,
  );
  const nextSourceBalance = sourceAccount.currentBalance - input.amount;
  const description = input.description?.trim() || null;

  const { data: paymentRecordRow, error: paymentRecordError } = await supabase
    .from("records")
    .insert({
      user_id: userId,
      account_id: accountId,
      record_type: "credit_card_payment",
      amount: input.amount,
      description,
      record_date: input.date,
      credit_card_id: creditCard.id,
      payment_source_account_id: input.paymentSourceAccountId,
    })
    .select("*")
    .single();

  if (paymentRecordError) throw paymentRecordError;

  const { error: sourceRecordError } = await supabase.from("records").insert({
    user_id: userId,
    account_id: input.paymentSourceAccountId,
    record_type: "transfer",
    amount: -input.amount,
    description,
    record_date: input.date,
    credit_card_id: creditCard.id,
  });

  if (sourceRecordError) throw sourceRecordError;

  const { error: creditCardBalanceError } = await supabase
    .from("accounts")
    .update({ current_balance: nextCreditCardBalance })
    .eq("id", accountId)
    .eq("user_id", userId);

  if (creditCardBalanceError) throw creditCardBalanceError;

  const { error: sourceBalanceError } = await supabase
    .from("accounts")
    .update({ current_balance: nextSourceBalance })
    .eq("id", input.paymentSourceAccountId)
    .eq("user_id", userId);

  if (sourceBalanceError) throw sourceBalanceError;

  await updateSavingsCycleMinimum(
    supabase,
    userId,
    input.paymentSourceAccountId,
    nextSourceBalance,
  );

  return {
    record: mapRecord(paymentRecordRow as DbRecord),
    nextBalance: nextCreditCardBalance,
  };
}
