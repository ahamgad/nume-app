import { describe, expect, it } from "vitest";

import { mergeFinanceCacheSnapshot } from "@/lib/finance/finance-cache";
import type { Account } from "@/lib/finance/types";

function account(overrides: Partial<Account> = {}): Account {
  return {
    id: "acct-1",
    name: "Main",
    type: "current_account",
    institution: null,
    accountNumberLast4: null,
    currentBalance: 1000,
    includeInNetWorth: true,
    includeInEmergencyFund: false,
    status: "active",
    createdAt: "",
    updatedAt: "2026-01-15T10:00:00.000Z",
    ...overrides,
  };
}

describe("finance-cache", () => {
  it("preserves balance timestamps on every cache merge", () => {
    const previous = {
      accounts: [account({ id: "acct-1", currentBalance: 1000 })],
      records: [],
      certificates: [],
      certificateSchedules: [],
      savingsAccounts: [],
      loans: [],
      creditCards: [],
    };
    const next = {
      ...previous,
      accounts: [
        account({
          id: "acct-1",
          name: "Renamed",
          currentBalance: 1000,
          updatedAt: "2026-06-26T12:00:00.000Z",
        }),
      ],
    };

    expect(
      mergeFinanceCacheSnapshot(previous, next).accounts[0]?.updatedAt,
    ).toBe("2026-01-15T10:00:00.000Z");
  });

  it("accepts new balance timestamps when balance changes", () => {
    const previous = {
      accounts: [account({ id: "acct-1", currentBalance: 1000 })],
      records: [],
      certificates: [],
      certificateSchedules: [],
      savingsAccounts: [],
      loans: [],
      creditCards: [],
    };
    const next = {
      ...previous,
      accounts: [
        account({
          id: "acct-1",
          currentBalance: 1200,
          updatedAt: "2026-06-26T12:00:00.000Z",
        }),
      ],
    };

    expect(
      mergeFinanceCacheSnapshot(previous, next).accounts[0]?.updatedAt,
    ).toBe("2026-06-26T12:00:00.000Z");
  });
});
