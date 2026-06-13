/** Money account types enabled in Phase 2 (progressive rollout). */
export type MoneyAccountType = "current_account" | "cash" | "wallet";

export type AccountType =
  | MoneyAccountType
  | "savings_account"
  | "certificate"
  | "gold"
  | "stocks"
  | "loan"
  | "credit_card";

/** Types exposed in the Add Account flow for the current release. */
export const ENABLED_ADD_ACCOUNT_TYPES: MoneyAccountType[] = [
  "current_account",
  "cash",
  "wallet",
];

export function isEnabledAddAccountType(
  type: string,
): type is MoneyAccountType {
  return ENABLED_ADD_ACCOUNT_TYPES.includes(type as MoneyAccountType);
}

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
  type?: MoneyAccountType;
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
  lockedCertificatePrincipal: number;
  availableWealth: number;
}
