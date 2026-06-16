import { describe, expect, it } from "vitest";

import {
  applyAccountPatch,
  isAccountSettingsOnlyPatch,
} from "@/lib/finance/account-settings-cache";
import type { Account } from "@/lib/finance/types";

function account(overrides: Partial<Account> = {}): Account {
  return {
    id: "acct-1",
    userId: "user-1",
    name: "Main",
    type: "current_account",
    institution: null,
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
  it("detects settings-only patches", () => {
    expect(
      isAccountSettingsOnlyPatch({ includeInNetWorth: false }),
    ).toBe(true);
    expect(
      isAccountSettingsOnlyPatch({
        includeInNetWorth: true,
        includeInEmergencyFund: true,
      }),
    ).toBe(true);
    expect(isAccountSettingsOnlyPatch({ name: "Updated" })).toBe(false);
    expect(
      isAccountSettingsOnlyPatch({
        includeInNetWorth: false,
        name: "Updated",
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
});

describe("certificate settings persistence guard", () => {
  it("requires account patch when only settings fields are provided", () => {
    const input = { includeInNetWorth: false };
    expect(isAccountSettingsOnlyPatch(input)).toBe(true);
    expect(Object.keys(input)).not.toContain("renewalType");
  });
});
