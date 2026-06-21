import type { CreditCard } from "@/lib/credit-cards/types";

export interface DbCreditCard {
  id: string;
  user_id: string;
  account_id: string;
  card_number_last4: string | null;
  statement_close_day?: number;
  payment_due_day?: number;
  credit_limit?: number | null;
  created_at: string;
  updated_at: string;
}

export function mapCreditCard(
  row: DbCreditCard,
  paymentSourceAccountId: string | null = null,
): CreditCard {
  return {
    id: row.id,
    userId: row.user_id,
    accountId: row.account_id,
    cardNumberLast4: row.card_number_last4,
    statementCloseDay: row.statement_close_day ?? 1,
    paymentDueDay: row.payment_due_day ?? 15,
    creditLimit:
      row.credit_limit === null || row.credit_limit === undefined
        ? null
        : Number(row.credit_limit),
    paymentSourceAccountId,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
