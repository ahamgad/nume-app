export type AccountType = "current_account";

export type RecordType = "income" | "expense" | "adjustment";

export interface Account {
  id: string;
  type: AccountType;
  name: string;
  institution: string | null;
  currentBalance: number;
  includeInNetWorth: boolean;
  includeInEmergencyFund: boolean;
  status: "active" | "archived";
  createdAt: string;
  updatedAt: string;
}

export interface FinanceRecord {
  id: string;
  accountId: string;
  type: RecordType;
  amount: number;
  description: string | null;
  date: string;
  createdAt: string;
}

export interface CreateAccountInput {
  name: string;
  institution?: string | null;
  currentBalance: number;
  includeInNetWorth?: boolean;
  includeInEmergencyFund?: boolean;
}

export interface CreateRecordInput {
  accountId: string;
  type: RecordType;
  amount: number;
  description?: string | null;
  date: string;
}

export interface NetWorthSummary {
  netWorth: number;
  assets: number;
  liabilities: number;
}
