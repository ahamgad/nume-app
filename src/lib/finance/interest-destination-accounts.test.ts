import { describe, expect, it, vi } from "vitest";

import type { Account } from "@/lib/finance/types";
import {
  filterInterestDestinationAccounts,
  isInterestDestinationInstitution,
} from "@/lib/finance/interest-destination-accounts";

const t = vi.fn((key: string) => key);

function account(partial: Partial<Account> & Pick<Account, "id">): Account {
  return {
    name: "Test",
    type: "current_account",
    institution: "CIB",
    currentBalance: 0,
    includeInNetWorth: true,
    includeInEmergencyFund: false,
    status: "active",
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
    userId: "u",
    ...partial,
  };
}

describe("interest destination account filtering", () => {
  it("accepts bank and financial-service institutions", () => {
    expect(isInterestDestinationInstitution("CIB", t)).toBe(true);
    expect(isInterestDestinationInstitution("Thndr", t)).toBe(true);
  });

  it("rejects accounts without a catalog institution", () => {
    expect(isInterestDestinationInstitution(null, t)).toBe(false);
    expect(isInterestDestinationInstitution("Custom Bank", t)).toBe(false);
  });

  it("filters transfer-capable accounts by institution category", () => {
    const accounts = [
      account({ id: "1", type: "current_account", institution: "CIB" }),
      account({ id: "2", type: "wallet", institution: "Klivvr" }),
      account({ id: "3", type: "cash", institution: null }),
    ];

    expect(filterInterestDestinationAccounts(accounts, t).map((a) => a.id)).toEqual([
      "1",
      "2",
    ]);
  });
});
