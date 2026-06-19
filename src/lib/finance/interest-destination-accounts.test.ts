import { describe, expect, it } from "vitest";

import type { Account } from "@/lib/finance/types";
import {
  assertDestinationAccount,
  canBeDestinationAccount,
  filterDestinationAccounts,
  filterInterestDestinationAccounts,
} from "@/lib/finance/interest-destination-accounts";

function account(partial: Partial<Account> & Pick<Account, "id">): Account {
  return {
    name: "Test",
    type: "current_account",
    institution: null,
    accountNumberLast4: null,
    currentBalance: 0,
    includeInNetWorth: true,
    includeInEmergencyFund: false,
    status: "active",
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
    ...partial,
  };
}

describe("destination account eligibility", () => {
  it("accepts active current, savings, wallet, and cash accounts", () => {
    for (const type of [
      "current_account",
      "savings_account",
      "wallet",
      "cash",
    ] as const) {
      expect(canBeDestinationAccount({ type, status: "active" })).toBe(true);
    }
  });

  it("rejects wealth-only and liability account types", () => {
    for (const type of [
      "certificate",
      "gold",
      "stocks",
      "loan",
      "credit_card",
    ] as const) {
      expect(canBeDestinationAccount({ type, status: "active" })).toBe(false);
    }
  });

  it("rejects archived accounts regardless of type", () => {
    expect(
      canBeDestinationAccount({ type: "cash", status: "archived" }),
    ).toBe(false);
  });

  it("includes cash and wallet accounts without institutions", () => {
    const accounts = [
      account({ id: "1", type: "current_account", institution: "CIB" }),
      account({ id: "2", type: "wallet", institution: null }),
      account({ id: "3", type: "cash", institution: null }),
      account({ id: "4", type: "savings_account", institution: null }),
      account({ id: "5", type: "certificate", institution: "CIB" }),
      account({ id: "6", type: "gold" }),
    ];

    expect(filterDestinationAccounts(accounts).map((a) => a.id)).toEqual([
      "1",
      "2",
      "3",
      "4",
    ]);
  });

  it("excludes specified account ids", () => {
    const accounts = [
      account({ id: "1", type: "cash" }),
      account({ id: "2", type: "wallet" }),
    ];

    expect(
      filterDestinationAccounts(accounts, { excludeAccountIds: ["1"] }).map(
        (a) => a.id,
      ),
    ).toEqual(["2"]);
  });

  it("exposes filterInterestDestinationAccounts alias", () => {
    const accounts = [account({ id: "1", type: "cash" })];
    expect(filterInterestDestinationAccounts(accounts).map((a) => a.id)).toEqual([
      "1",
    ]);
  });
});

describe("assertDestinationAccount", () => {
  it("rejects wealth-only destination types", async () => {
    const supabase = {
      from: () => ({
        select: () => ({
          eq: () => ({
            eq: () => ({
              maybeSingle: async () => ({
                data: {
                  id: "dest-1",
                  account_type: "certificate",
                  status: "active",
                },
                error: null,
              }),
            }),
          }),
        }),
      }),
    };

    await expect(
      assertDestinationAccount(
        supabase as never,
        "user-1",
        "dest-1",
      ),
    ).rejects.toThrow(/cannot receive transfers/);
  });

  it("accepts active cash destinations", async () => {
    const supabase = {
      from: () => ({
        select: () => ({
          eq: () => ({
            eq: () => ({
              maybeSingle: async () => ({
                data: {
                  id: "dest-1",
                  account_type: "cash",
                  status: "active",
                },
                error: null,
              }),
            }),
          }),
        }),
      }),
    };

    await expect(
      assertDestinationAccount(
        supabase as never,
        "user-1",
        "dest-1",
      ),
    ).resolves.toBeUndefined();
  });
});
