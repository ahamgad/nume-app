export type SavingsInterestModel = "fixed" | "tiered";

export type SavingsPostingFrequency =
  | "daily"
  | "monthly"
  | "quarterly"
  | "semi_annual"
  | "annual";

export type SavingsInterestDestination = "same_account" | "another_account";

export interface SavingsInterestTier {
  id: string;
  savingsAccountId: string;
  userId: string;
  minBalance: number;
  maxBalance: number | null;
  annualInterestRate: number;
  sortOrder: number;
}

export interface SavingsAccount {
  id: string;
  userId: string;
  accountId: string;
  interestModel: SavingsInterestModel;
  annualInterestRate: number | null;
  postingFrequency: SavingsPostingFrequency;
  postingDay: number;
  interestDestination: SavingsInterestDestination;
  destinationAccountId: string | null;
  cycleStartDate: string;
  cycleMinimumBalance: number;
  nextPostingDate: string | null;
  lastPostingProcessedAt: string | null;
  excludeWeekends: boolean;
  excludeEgyptianHolidays: boolean;
  tiers: SavingsInterestTier[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateSavingsAccountInput {
  name: string;
  institution?: string | null;
  openingBalance: number;
  interestModel: SavingsInterestModel;
  annualInterestRate?: number | null;
  tiers?: Omit<SavingsInterestTier, "id" | "savingsAccountId" | "userId">[];
  postingFrequency: SavingsPostingFrequency;
  postingDay: number;
  excludeWeekends?: boolean;
  excludeEgyptianHolidays?: boolean;
  interestDestination: SavingsInterestDestination;
  destinationAccountId?: string | null;
  includeInNetWorth?: boolean;
  includeInEmergencyFund?: boolean;
}

export interface UpdateSavingsAccountInput {
  name?: string;
  institution?: string | null;
  interestModel?: SavingsInterestModel;
  annualInterestRate?: number | null;
  tiers?: Omit<SavingsInterestTier, "id" | "savingsAccountId" | "userId">[];
  postingFrequency?: SavingsPostingFrequency;
  postingDay?: number;
  excludeWeekends?: boolean;
  excludeEgyptianHolidays?: boolean;
  interestDestination?: SavingsInterestDestination;
  destinationAccountId?: string | null;
}

export interface ProcessSavingsInterestResult {
  savingsAccountId: string;
  processed: boolean;
  interestAmount: number;
  postingDate: string | null;
}
