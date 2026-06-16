import type { Account, AccountType, FinanceRecord, RecordType } from "@/lib/finance/types";

export interface DbAccount {
  id: string;
  user_id: string;
  account_type: AccountType;
  name: string;
  institution: string | null;
  current_balance: number;
  include_in_net_worth: boolean;
  include_in_emergency_fund: boolean;
  status: "active" | "archived";
  created_at: string;
  updated_at: string;
}

export interface DbRecord {
  id: string;
  user_id: string;
  account_id: string;
  record_type: RecordType | "system";
  amount: number;
  description: string | null;
  record_date: string;
  certificate_id: string | null;
  schedule_entry_id: string | null;
  savings_account_id: string | null;
  created_at: string;
}

export function mapAccount(row: DbAccount): Account {
  return {
    id: row.id,
    type: row.account_type,
    name: row.name,
    institution: row.institution,
    currentBalance: Number(row.current_balance),
    includeInNetWorth: row.include_in_net_worth,
    includeInEmergencyFund: row.include_in_emergency_fund,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapRecord(row: DbRecord): FinanceRecord {
  return {
    id: row.id,
    accountId: row.account_id,
    type: row.record_type as RecordType,
    amount: Number(row.amount),
    description: row.description,
    date: row.record_date,
    certificateId: row.certificate_id ?? null,
    scheduleEntryId: row.schedule_entry_id ?? null,
    savingsAccountId: row.savings_account_id ?? null,
    createdAt: row.created_at,
  };
}
