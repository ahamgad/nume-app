import { describe, expect, it } from "vitest";

import {
  applyCreditCardPayment,
  applyCreditCardPurchase,
  toDisplayOutstandingBalance,
  toStoredCreditCardBalance,
} from "@/lib/credit-cards/balance";
import { calculateCreditUtilization } from "@/lib/credit-cards/utilization";

describe("credit card balance conventions", () => {
  it("stores outstanding amounts as negative balances", () => {
    expect(toStoredCreditCardBalance(5000)).toBe(-5000);
    expect(toStoredCreditCardBalance(0)).toBe(0);
  });

  it("displays absolute outstanding amounts in UI", () => {
    expect(toDisplayOutstandingBalance(-5000)).toBe(5000);
    expect(toDisplayOutstandingBalance(0)).toBe(0);
    expect(toDisplayOutstandingBalance(100)).toBe(0);
  });

  it("increases debt on purchase", () => {
    expect(applyCreditCardPurchase(-4000, 500)).toBe(-4500);
  });

  it("decreases debt on payment and caps at zero", () => {
    expect(applyCreditCardPayment(-4500, 1000)).toBe(-3500);
    expect(applyCreditCardPayment(-500, 800)).toBe(0);
  });

  it("calculates utilization when credit limit is set", () => {
    expect(calculateCreditUtilization(-2500, 10000)).toBe(25);
    expect(calculateCreditUtilization(0, 10000)).toBe(0);
    expect(calculateCreditUtilization(-2500, null)).toBeNull();
  });
});
