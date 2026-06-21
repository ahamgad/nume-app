import type { Loan } from "@/lib/lending/types";

export interface DbLoan {
  id: string;
  user_id: string;
  account_id: string;
  loan_number_last4: string | null;
  created_at: string;
  updated_at: string;
}

export function mapLoan(row: DbLoan): Loan {
  return {
    id: row.id,
    userId: row.user_id,
    accountId: row.account_id,
    loanNumberLast4: row.loan_number_last4,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
