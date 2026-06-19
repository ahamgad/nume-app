export interface Loan {
  id: string;
  userId: string;
  accountId: string;
  loanNumberLast4: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreditCard {
  id: string;
  userId: string;
  accountId: string;
  cardNumberLast4: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLoanInput {
  name: string;
  institution?: string | null;
  currentBalance: number;
  loanNumberLast4?: string | null;
  includeInNetWorth?: boolean;
  includeInEmergencyFund?: boolean;
}

export interface UpdateLoanInput {
  name?: string;
  institution?: string | null;
  loanNumberLast4?: string | null;
  includeInNetWorth?: boolean;
  includeInEmergencyFund?: boolean;
}

export interface CreateCreditCardInput {
  name: string;
  institution?: string | null;
  currentBalance: number;
  cardNumberLast4?: string | null;
  includeInNetWorth?: boolean;
  includeInEmergencyFund?: boolean;
}

export interface UpdateCreditCardInput {
  name?: string;
  institution?: string | null;
  cardNumberLast4?: string | null;
  includeInNetWorth?: boolean;
  includeInEmergencyFund?: boolean;
}

export type LendingAccountType = "loan" | "credit_card";
