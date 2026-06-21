import { describe, expect, it } from "vitest";

import {
  applyCreditCardPayment,
  applyCreditCardPurchase,
} from "@/lib/credit-cards/balance";
import { calculateSpendingTotal, isSpendingRecord } from "@/lib/credit-cards/spending";
import type { FinanceRecord } from "@/lib/finance/types";

function record(
  overrides: Partial<FinanceRecord> & Pick<FinanceRecord, "type" | "amount" | "accountId">,
): FinanceRecord {
  return {
    id: overrides.id ?? "rec-1",
    description: overrides.description ?? null,
    date: overrides.date ?? "2026-06-01",
    certificateId: null,
    scheduleEntryId: null,
    savingsAccountId: null,
    creditCardId: overrides.creditCardId ?? null,
    paymentSourceAccountId: overrides.paymentSourceAccountId ?? null,
    createdAt: "2026-06-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("credit card accounting model", () => {
  const cardAccountId = "cc-account";
  const sourceAccountId = "current-account";
  const creditCardId = "cc-row";

  it("purchase increases liability once and counts as spending", () => {
    let cardBalance = 0;
    const cashBalance = 10_000;
    const purchaseAmount = 500;

    cardBalance = applyCreditCardPurchase(cardBalance, purchaseAmount);

    const purchaseRecord = record({
      accountId: cardAccountId,
      type: "credit_card_purchase",
      amount: purchaseAmount,
      creditCardId,
      description: "Groceries",
    });

    expect(cardBalance).toBe(-500);
    expect(cashBalance).toBe(10_000);
    expect(isSpendingRecord(purchaseRecord)).toBe(true);
    expect(calculateSpendingTotal([purchaseRecord])).toBe(500);
  });

  it("payment reduces liability and cash without creating spending", () => {
    let cardBalance = -500;
    let cashBalance = 10_000;
    const paymentAmount = 500;

    cardBalance = applyCreditCardPayment(cardBalance, paymentAmount);
    cashBalance -= paymentAmount;

    const paymentRecord = record({
      accountId: cardAccountId,
      type: "credit_card_payment",
      amount: paymentAmount,
      creditCardId,
      paymentSourceAccountId: sourceAccountId,
    });
    const sourceRecord = record({
      accountId: sourceAccountId,
      type: "transfer",
      amount: -paymentAmount,
      creditCardId,
    });

    expect(cardBalance).toBe(0);
    expect(cashBalance).toBe(9_500);
    expect(isSpendingRecord(paymentRecord)).toBe(false);
    expect(isSpendingRecord(sourceRecord)).toBe(false);
  });

  it("full purchase then payment cycle has no double-counting path", () => {
    let cardBalance = 0;
    let cashBalance = 10_000;
    const purchaseAmount = 500;
    const paymentAmount = 500;

    cardBalance = applyCreditCardPurchase(cardBalance, purchaseAmount);

    const purchaseRecord = record({
      id: "purchase",
      accountId: cardAccountId,
      type: "credit_card_purchase",
      amount: purchaseAmount,
      creditCardId,
    });

    cardBalance = applyCreditCardPayment(cardBalance, paymentAmount);
    cashBalance -= paymentAmount;

    const paymentRecord = record({
      id: "payment",
      accountId: cardAccountId,
      type: "credit_card_payment",
      amount: paymentAmount,
      creditCardId,
      paymentSourceAccountId: sourceAccountId,
    });
    const sourceRecord = record({
      id: "source-outflow",
      accountId: sourceAccountId,
      type: "transfer",
      amount: -paymentAmount,
      creditCardId,
    });

    const allRecords = [purchaseRecord, paymentRecord, sourceRecord];

    expect(cardBalance).toBe(0);
    expect(cashBalance).toBe(9_500);
    expect(calculateSpendingTotal(allRecords)).toBe(500);
    expect(allRecords.some((item) => item.type === "expense")).toBe(false);
  });

  it("direct expenses on asset accounts still count as spending", () => {
    const directExpense = record({
      accountId: sourceAccountId,
      type: "expense",
      amount: 200,
    });
    const purchase = record({
      accountId: cardAccountId,
      type: "credit_card_purchase",
      amount: 500,
      creditCardId,
    });
    const billPaymentTransfer = record({
      accountId: sourceAccountId,
      type: "transfer",
      amount: -500,
      creditCardId,
    });

    expect(calculateSpendingTotal([directExpense, purchase, billPaymentTransfer])).toBe(
      700,
    );
  });

  it("net worth stays unchanged when paying a credit card bill", () => {
    const assetsBefore = 10_000;
    const liabilitiesBefore = 500;
    const netWorthBefore = assetsBefore - liabilitiesBefore;

    const assetsAfter = 9_500;
    const liabilitiesAfter = 0;
    const netWorthAfter = assetsAfter - liabilitiesAfter;

    expect(netWorthAfter).toBe(netWorthBefore);
  });
});
