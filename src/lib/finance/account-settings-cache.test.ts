import { describe, expect, it } from "vitest";

import {
  applyAccountPatch,
  isNonBalanceAccountPatch,
  preserveBalanceTimestamps,
} from "@/lib/finance/account-settings-cache";
import type { Account } from "@/lib/finance/types";

function account(overrides: Partial<Account> = {}): Account {
  return {
    id: "acct-1",
    userId: "user-1",
    name: "Main",
    type: "current_account",
    institution: null,
    accountNumberLast4: null,
    currentBalance: 1000,
    includeInNetWorth: true,
    includeInEmergencyFund: false,
    status: "active",
    createdAt: "",
    updatedAt: "",
    ...overrides,
  };
}

describe("account-settings-cache", () => {
  it("detects non-balance patches", () => {
    expect(isNonBalanceAccountPatch({ includeInNetWorth: false })).toBe(true);
    expect(
      isNonBalanceAccountPatch({
        includeInNetWorth: true,
        includeInEmergencyFund: true,
      }),
    ).toBe(true);
    expect(isNonBalanceAccountPatch({ name: "Updated" })).toBe(true);
    expect(
      isNonBalanceAccountPatch({
        includeInNetWorth: false,
        currentBalance: 500,
      }),
    ).toBe(false);
  });

  it("applies optimistic account setting updates in cache", () => {
    const cash = account({ id: "cash-1", type: "cash" });
    const certificateAccount = account({
      id: "cert-acct",
      type: "certificate",
    });

    const next = applyAccountPatch(
      { accounts: [account(), cash, certificateAccount], records: [] },
      "cert-acct",
      { includeInEmergencyFund: true },
    );

    expect(
      next?.accounts.find((item) => item.id === "cert-acct")?.includeInEmergencyFund,
    ).toBe(true);
    expect(
      next?.accounts.find((item) => item.id === "acct-1")?.includeInEmergencyFund,
    ).toBe(false);
  });

  it("supports rollback by restoring a previous snapshot", () => {
    const snapshot = {
      accounts: [account({ includeInNetWorth: true })],
      records: [],
    };

    const optimistic = applyAccountPatch(snapshot, "acct-1", {
      includeInNetWorth: false,
    });

    expect(
      optimistic?.accounts[0]?.includeInNetWorth,
    ).toBe(false);

    const rolledBack = applyAccountPatch(optimistic, "acct-1", {
      includeInNetWorth: snapshot.accounts[0]!.includeInNetWorth,
    });

    expect(rolledBack).toEqual(snapshot);
  });

  it("works consistently across supported account types", () => {
    const types = [
      "current_account",
      "cash",
      "wallet",
      "certificate",
    ] as const;

    for (const type of types) {
      const data = {
        accounts: [account({ id: type, type })],
        records: [],
      };

      const updated = applyAccountPatch(data, type, {
        includeInNetWorth: false,
        includeInEmergencyFund: true,
      });

      expect(updated?.accounts[0]).toMatchObject({
        includeInNetWorth: false,
        includeInEmergencyFund: true,
      });
    }
  });

  it("preserves updatedAt for non-balance optimistic patches", () => {
    const snapshot = {
      accounts: [
        account({
          updatedAt: "2026-01-15T10:00:00.000Z",
        }),
      ],
      records: [],
    };

    const next = applyAccountPatch(snapshot, "acct-1", {
      name: "Renamed",
      includeInNetWorth: false,
    });

    expect(next?.accounts[0]?.name).toBe("Renamed");
    expect(next?.accounts[0]?.updatedAt).toBe("2026-01-15T10:00:00.000Z");
  });

  it("preserves balance timestamps after refetch when balance is unchanged", () => {
    const previous = {
      accounts: [
        account({
          id: "acct-1",
          currentBalance: 1000,
          updatedAt: "2026-01-15T10:00:00.000Z",
        }),
      ],
      records: [],
    };
    const next = {
      accounts: [
        account({
          id: "acct-1",
          name: "Renamed",
          currentBalance: 1000,
          updatedAt: "2026-06-26T12:00:00.000Z",
        }),
      ],
      records: [],
    };

    expect(preserveBalanceTimestamps(previous, next).accounts[0]?.updatedAt).toBe(
      "2026-01-15T10:00:00.000Z",
    );
  });

  it("accepts new balance timestamps when balance changes", () => {
    const previous = {
      accounts: [
        account({
          id: "acct-1",
          currentBalance: 1000,
          updatedAt: "2026-01-15T10:00:00.000Z",
        }),
      ],
      records: [],
    };
    const next = {
      accounts: [
        account({
          id: "acct-1",
          currentBalance: 1200,
          updatedAt: "2026-06-26T12:00:00.000Z",
        }),
      ],
      records: [],
    };

    expect(preserveBalanceTimestamps(previous, next).accounts[0]?.updatedAt).toBe(
      "2026-06-26T12:00:00.000Z",
    );
  });
});
