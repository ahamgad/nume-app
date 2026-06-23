import { describe, expect, it } from "vitest";

import {
  BALANCE_DISPLAY_CLASS,
  BALANCE_DISPLAY_SIGN_MODE,
  getBalanceDisplayProps,
  getBalanceToneClassName,
} from "@/lib/finance/balance-display";
import { getCurrencyDisplayParts } from "@/lib/format/currency-display";
import type { AccountType } from "@/lib/finance/types";

describe("getBalanceToneClassName", () => {
  it("returns unified foreground for all balances", () => {
    expect(
      getBalanceToneClassName({ type: "current_account", currentBalance: 0 }),
    ).toBe(BALANCE_DISPLAY_CLASS);
    expect(
      getBalanceToneClassName({ type: "current_account", currentBalance: 100 }),
    ).toBe(BALANCE_DISPLAY_CLASS);
    expect(
      getBalanceToneClassName({ type: "current_account", currentBalance: -50 }),
    ).toBe(BALANCE_DISPLAY_CLASS);
    expect(
      getBalanceToneClassName({ type: "credit_card" as AccountType, currentBalance: -500 }),
    ).toBe(BALANCE_DISPLAY_CLASS);
  });
});

describe("balance display foundation", () => {
  it("uses balance sign mode without positive prefix", () => {
    expect(getBalanceDisplayProps().signMode).toBe(BALANCE_DISPLAY_SIGN_MODE);
    expect(
      getCurrencyDisplayParts(100, "en-EG", {
        signMode: BALANCE_DISPLAY_SIGN_MODE,
      }).signPrefix,
    ).toBe("");
  });

  it("shows minus prefix for negative values", () => {
    expect(
      getCurrencyDisplayParts(-100, "en-EG", {
        signMode: BALANCE_DISPLAY_SIGN_MODE,
      }).signPrefix,
    ).toBe("− ");
  });

  it("uses unified foreground color", () => {
    expect(getBalanceDisplayProps().className).toBe(BALANCE_DISPLAY_CLASS);
  });
});
