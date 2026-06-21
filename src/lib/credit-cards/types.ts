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
  /** Existing account this credit card is tied to (payment source). */
  linkedAccountId: string;
  /** Amount owed as a positive number; stored internally as negative balance. */
  outstandingBalance: number;
  cardNumberLast4?: string | null;
  paymentDueDay?: number;
  creditLimit: number;
}

export interface UpdateCreditCardInput {
  name?: string;
  cardNumberLast4?: string | null;
  paymentDueDay?: number;
  creditLimit?: number | null;
  linkedAccountId?: string | null;
  clearLinkedAccount?: boolean;
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
