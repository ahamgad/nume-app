import { describe, expect, it } from "vitest";

import { getBalanceToneClassName } from "@/lib/finance/balance-display";
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
