export interface CreditCard {
  id: string;
  userId: string;
  accountId: string;
  cardNumberLast4: string | null;
  statementCloseDay: number;
  paymentDueDay: number;
  creditLimit: number | null;
  paymentSourceAccountId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCreditCardInput {
  name: string;
  institution?: string | null;
  /** Amount owed as a positive number; stored internally as negative balance. */
  outstandingBalance: number;
  cardNumberLast4?: string | null;
  statementCloseDay?: number;
  paymentDueDay?: number;
  creditLimit?: number | null;
  paymentSourceAccountId?: string | null;
  includeInNetWorth?: boolean;
  includeInEmergencyFund?: boolean;
}

export interface UpdateCreditCardInput {
  name?: string;
  institution?: string | null;
  cardNumberLast4?: string | null;
  statementCloseDay?: number;
  paymentDueDay?: number;
  creditLimit?: number | null;
  paymentSourceAccountId?: string | null;
  clearPaymentSource?: boolean;
  includeInNetWorth?: boolean;
  includeInEmergencyFund?: boolean;
}

export interface AddCreditCardPurchaseInput {
  amount: number;
  description?: string | null;
  date: string;
}

export interface MakeCreditCardPaymentInput {
  amount: number;
  paymentSourceAccountId: string;
  description?: string | null;
  date: string;
}
