import type { SupabaseClient } from "@supabase/supabase-js";

import { isEligibleDailyPayoutDate } from "@/lib/business-days/calendar";
import { canReceiveTransfers } from "@/lib/finance/account-capabilities";
import { fetchAccounts, insertSavingsInterestRecord } from "@/lib/finance/service";
import { todayIsoDate } from "@/lib/format/date";
import { resolveSavingsDailyContext } from "@/lib/savings/business-days-context";
import {
  calculateSavingsInterest,
  resolveInterestRate,
  SAVINGS_INTEREST_RECORD_DESCRIPTION,
} from "@/lib/savings/interest-engine";
import { isPostingDue } from "@/lib/savings/posting-schedule";
import { getSavingsByAccountId } from "@/lib/savings/load-savings";
import {
  advanceSavingsNextPostingDateSkip,
  resetSavingsCycleAfterPosting,
} from "@/lib/savings/service";
import type { SavingsAccount } from "@/lib/savings/types";
import type { DailyBusinessDayContext } from "@/lib/business-days/types";

const processingLocks = new Set<string>();
const MAX_CATCH_UP_CYCLES = 240;

async function loadDestinationBalance(
  supabase: SupabaseClient,
  userId: string,
  accountId: string,
): Promise<number> {
  const accounts = await fetchAccounts(supabase, userId);
  return accounts.find((account) => account.id === accountId)?.currentBalance ?? 0;
}

async function hasInterestRecordForPosting(
  supabase: SupabaseClient,
  userId: string,
  savingsAccountId: string,
  postingDate: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from("records")
    .select("id")
    .eq("user_id", userId)
    .eq("savings_account_id", savingsAccountId)
    .eq("record_type", "interest")
    .eq("record_date", postingDate)
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return Boolean(data);
}

async function advanceCycleAfterPosting(
  supabase: SupabaseClient,
  userId: string,
  savings: SavingsAccount,
  postingDate: string,
  balanceAfterPosting: number,
  dailyContext?: DailyBusinessDayContext,
): Promise<void> {
  await resetSavingsCycleAfterPosting(
    supabase,
    userId,
    savings.id,
    postingDate,
    balanceAfterPosting,
    savings.postingFrequency,
    savings.postingDay,
    dailyContext,
  );
}

async function skipNonBusinessPostingDay(
  supabase: SupabaseClient,
  userId: string,
  savings: SavingsAccount,
  skippedDate: string,
  dailyContext: DailyBusinessDayContext,
): Promise<void> {
  await advanceSavingsNextPostingDateSkip(
    supabase,
    userId,
    savings.id,
    skippedDate,
    savings.postingFrequency,
    savings.postingDay,
    dailyContext,
  );
}

async function processDuePosting(
  supabase: SupabaseClient,
  userId: string,
  savings: SavingsAccount,
  postingDate: string,
  dailyContext?: DailyBusinessDayContext,
): Promise<boolean> {
  const alreadyPosted = await hasInterestRecordForPosting(
    supabase,
    userId,
    savings.id,
    postingDate,
  );

  if (alreadyPosted) {
    const balance = await loadDestinationBalance(
      supabase,
      userId,
      savings.accountId,
    );
    await advanceCycleAfterPosting(
      supabase,
      userId,
      savings,
      postingDate,
      balance,
      dailyContext,
    );
    return true;
  }

  const rate = resolveInterestRate(
    savings.interestModel,
    savings.annualInterestRate,
    savings.tiers,
    savings.cycleMinimumBalance,
  );

  if (rate === null || rate <= 0) {
    const balance = await loadDestinationBalance(
      supabase,
      userId,
      savings.accountId,
    );
    await advanceCycleAfterPosting(
      supabase,
      userId,
      savings,
      postingDate,
      balance,
      dailyContext,
    );
    return true;
  }

  const interestAmount = calculateSavingsInterest(
    savings.cycleMinimumBalance,
    rate,
    savings.postingFrequency,
  );

  if (interestAmount <= 0) {
    const balance = await loadDestinationBalance(
      supabase,
      userId,
      savings.accountId,
    );
    await advanceCycleAfterPosting(
      supabase,
      userId,
      savings,
      postingDate,
      balance,
      dailyContext,
    );
    return true;
  }

  if (savings.interestDestination === "same_account") {
    const currentBalance = await loadDestinationBalance(
      supabase,
      userId,
      savings.accountId,
    );
    await insertSavingsInterestRecord(supabase, userId, {
      accountId: savings.accountId,
      amount: interestAmount,
      date: postingDate,
      description: SAVINGS_INTEREST_RECORD_DESCRIPTION,
      savingsAccountId: savings.id,
      updateBalance: true,
      currentBalance,
    });
    await advanceCycleAfterPosting(
      supabase,
      userId,
      savings,
      postingDate,
      currentBalance + interestAmount,
      dailyContext,
    );
    return true;
  }

  if (savings.destinationAccountId) {
    const accounts = await fetchAccounts(supabase, userId);
    const destination = accounts.find(
      (account) => account.id === savings.destinationAccountId,
    );
    if (destination && canReceiveTransfers(destination)) {
      await insertSavingsInterestRecord(supabase, userId, {
        accountId: destination.id,
        amount: interestAmount,
        date: postingDate,
        description: SAVINGS_INTEREST_RECORD_DESCRIPTION,
        savingsAccountId: savings.id,
        updateBalance: true,
        currentBalance: destination.currentBalance,
      });
    }
    const savingsBalance = await loadDestinationBalance(
      supabase,
      userId,
      savings.accountId,
    );
    await advanceCycleAfterPosting(
      supabase,
      userId,
      savings,
      postingDate,
      savingsBalance,
      dailyContext,
    );
    return true;
  }

  const balance = await loadDestinationBalance(
    supabase,
    userId,
    savings.accountId,
  );
  await advanceCycleAfterPosting(
    supabase,
    userId,
    savings,
    postingDate,
    balance,
    dailyContext,
  );
  return true;
}

/**
 * Processes all due posting cycles for one savings account sequentially.
 * Idempotent: re-opening the app will not duplicate interest for the same cycle.
 */
export async function processSavingsInterestCatchUp(
  supabase: SupabaseClient,
  userId: string,
  savingsAccountId: string,
): Promise<number> {
  if (processingLocks.has(savingsAccountId)) return 0;

  processingLocks.add(savingsAccountId);
  try {
    const { data, error } = await supabase
      .from("savings_accounts")
      .select("account_id")
      .eq("id", savingsAccountId)
      .eq("user_id", userId)
      .single();

    if (error) throw error;

    const today = todayIsoDate();
    let processedCount = 0;

    while (processedCount < MAX_CATCH_UP_CYCLES) {
      const savings = await getSavingsByAccountId(
        supabase,
        userId,
        data.account_id,
      );
      if (!savings || !isPostingDue(savings.nextPostingDate, today)) {
        break;
      }

      const postingDate = savings.nextPostingDate!;
      const dailyContext = await resolveSavingsDailyContext(supabase, savings);

      if (
        dailyContext &&
        !isEligibleDailyPayoutDate(
          postingDate,
          dailyContext.settings,
          dailyContext.observedHolidayDates,
        )
      ) {
        await skipNonBusinessPostingDay(
          supabase,
          userId,
          savings,
          postingDate,
          dailyContext,
        );
        processedCount += 1;
        continue;
      }

      await processDuePosting(
        supabase,
        userId,
        savings,
        postingDate,
        dailyContext,
      );
      processedCount += 1;
    }

    return processedCount;
  } finally {
    processingLocks.delete(savingsAccountId);
  }
}

export async function processAllDueSavingsInterest(
  supabase: SupabaseClient,
  userId: string,
  savingsAccountIds: string[],
): Promise<void> {
  for (const savingsAccountId of savingsAccountIds) {
    try {
      await processSavingsInterestCatchUp(supabase, userId, savingsAccountId);
    } catch {
      // Continue processing other accounts
    }
  }
}
