import type {
  SavingsAccount,
  SavingsInterestModel,
  SavingsInterestTier,
  SavingsInterestDestination,
  SavingsPostingFrequency,
} from "@/lib/savings/types";

export interface DbSavingsInterestTier {
  id: string;
  user_id: string;
  savings_account_id: string;
  min_balance: number;
  max_balance: number | null;
  annual_interest_rate: number;
  sort_order: number;
}

export interface DbSavingsAccount {
  id: string;
  user_id: string;
  account_id: string;
  interest_model: SavingsInterestModel;
  annual_interest_rate: number | null;
  posting_frequency: SavingsPostingFrequency;
  posting_day: number;
  interest_destination: SavingsInterestDestination;
  destination_account_id: string | null;
  cycle_start_date: string;
  cycle_minimum_balance: number;
  next_posting_date: string | null;
  last_posting_processed_at: string | null;
  created_at: string;
  updated_at: string;
  savings_interest_tiers?: DbSavingsInterestTier[];
}

export function mapSavingsInterestTier(row: DbSavingsInterestTier): SavingsInterestTier {
  return {
    id: row.id,
    savingsAccountId: row.savings_account_id,
    userId: row.user_id,
    minBalance: Number(row.min_balance),
    maxBalance: row.max_balance === null ? null : Number(row.max_balance),
    annualInterestRate: Number(row.annual_interest_rate),
    sortOrder: row.sort_order,
  };
}

export function mapSavingsAccount(row: DbSavingsAccount): SavingsAccount {
  const tiers = (row.savings_interest_tiers ?? [])
    .map(mapSavingsInterestTier)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return {
    id: row.id,
    userId: row.user_id,
    accountId: row.account_id,
    interestModel: row.interest_model,
    annualInterestRate:
      row.annual_interest_rate === null ? null : Number(row.annual_interest_rate),
    postingFrequency: row.posting_frequency,
    postingDay: row.posting_day,
    interestDestination: row.interest_destination,
    destinationAccountId: row.destination_account_id,
    cycleStartDate: row.cycle_start_date,
    cycleMinimumBalance: Number(row.cycle_minimum_balance),
    nextPostingDate: row.next_posting_date,
    lastPostingProcessedAt: row.last_posting_processed_at,
    tiers,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
