import { describe, expect, it } from "vitest";

import {
  ACCOUNT_DETAILS_BALANCE_SIGN_MODE,
  ACCOUNT_DETAILS_BALANCE_CLASS,
  getAccountDetailsBalanceDisplayProps,
  getBalanceToneClassName,
} from "@/lib/finance/balance-display";
import { getCurrencyDisplayParts } from "@/lib/format/currency-display";
import type { AccountType } from "@/lib/finance/types";

describe("getBalanceToneClassName", () => {
  it("returns neutral for zero balances", () => {
    expect(
      getBalanceToneClassName({ type: "current_account", currentBalance: 0 }),
    ).toBeUndefined();
    expect(
      getBalanceToneClassName({ type: "credit_card", currentBalance: 0 }),
    ).toBeUndefined();
  });

  it("uses success for positive asset balances", () => {
    expect(
      getBalanceToneClassName({ type: "current_account", currentBalance: 100 }),
    ).toContain("emerald");
  });

  it("uses danger for negative asset balances", () => {
    expect(
      getBalanceToneClassName({ type: "current_account", currentBalance: -50 }),
    ).toContain("destructive");
  });

  it("uses danger for credit card outstanding balances", () => {
    expect(
      getBalanceToneClassName({ type: "credit_card" as AccountType, currentBalance: -500 }),
    ).toContain("destructive");
  });
});

describe("account details balance display", () => {
  it("uses balance sign mode without positive prefix", () => {
    expect(getAccountDetailsBalanceDisplayProps().signMode).toBe(
      ACCOUNT_DETAILS_BALANCE_SIGN_MODE,
    );
    expect(
      getCurrencyDisplayParts(100, "en-EG", {
        signMode: ACCOUNT_DETAILS_BALANCE_SIGN_MODE,
      }).signPrefix,
    ).toBe("");
  });

  it("shows minus prefix for negative values", () => {
    expect(
      getCurrencyDisplayParts(-100, "en-EG", {
        signMode: ACCOUNT_DETAILS_BALANCE_SIGN_MODE,
      }).signPrefix,
    ).toBe("− ");
  });

  it("uses unified foreground color without semantic tones", () => {
    expect(getAccountDetailsBalanceDisplayProps().className).toBe(
      ACCOUNT_DETAILS_BALANCE_CLASS,
    );
  });
});
