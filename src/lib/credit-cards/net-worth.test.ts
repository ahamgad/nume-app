import { describe, expect, it } from "vitest";

import { calculateNetWorth } from "@/lib/finance/net-worth";
import type { Account } from "@/lib/finance/types";

function liabilityAccount(
  id: string,
  balance: number,
  type: Account["type"] = "credit_card",
): Account {
  return {
    id,
    type,
    name: "Card",
    institution: "CIB",
    accountNumberLast4: null,
    currentBalance: balance,
    includeInNetWorth: true,
    includeInEmergencyFund: false,
    status: "active",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  };
}

describe("credit card net worth integration", () => {
  it("counts negative credit card balances as liabilities", () => {
    const accounts: Account[] = [
      {
        ...liabilityAccount("asset", 10000, "current_account"),
        currentBalance: 10000,
      },
      liabilityAccount("cc", -5000),
    ];

    const summary = calculateNetWorth(accounts);
    expect(summary.assets).toBe(10000);
    expect(summary.liabilities).toBe(5000);
    expect(summary.netWorth).toBe(5000);
  });

  it("excludes archived or opted-out credit cards", () => {
    const accounts: Account[] = [
      {
        ...liabilityAccount("cc", -5000),
        includeInNetWorth: false,
      },
    ];

    expect(calculateNetWorth(accounts).netWorth).toBe(0);
  });
});
