import type { CreditCard, Loan } from "@/lib/lending/types";

export interface DbLoan {
  id: string;
  user_id: string;
  account_id: string;
  loan_number_last4: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbCreditCard {
  id: string;
  user_id: string;
  account_id: string;
  card_number_last4: string | null;
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

export function mapCreditCard(row: DbCreditCard): CreditCard {
  return {
    id: row.id,
    userId: row.user_id,
    accountId: row.account_id,
    cardNumberLast4: row.card_number_last4,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
