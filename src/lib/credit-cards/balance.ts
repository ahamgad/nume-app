/** Stored credit card balances are negative (amount owed). */

export function toStoredCreditCardBalance(outstandingAmount: number): number {
  if (outstandingAmount <= 0) return 0;
  return -outstandingAmount;
}

export function toDisplayOutstandingBalance(storedBalance: number): number {
  if (storedBalance >= 0) return 0;
  return Math.abs(storedBalance);
}

/** Balance shown in account lists and liability cards (never negative). */
export function getLiabilityDisplayBalance(storedBalance: number): number {
  return toDisplayOutstandingBalance(storedBalance);
}

export function applyCreditCardPurchase(
  storedBalance: number,
  purchaseAmount: number,
): number {
  if (purchaseAmount <= 0) {
    throw new Error("Purchase amount must be greater than zero");
  }
  return storedBalance - purchaseAmount;
}

export function applyCreditCardPayment(
  storedBalance: number,
  paymentAmount: number,
): number {
  if (paymentAmount <= 0) {
    throw new Error("Payment amount must be greater than zero");
  }
  const next = storedBalance + paymentAmount;
  return next > 0 ? 0 : next;
}
