import { describe, expect, it } from "vitest";

import {
  findDuplicateAccountIdentity,
  normalizeAccountIdentity,
} from "@/lib/finance/account-identity-validation";
import { sortAccountsByCreatedAtDesc } from "@/lib/finance/account-sort";
import type { Account } from "@/lib/finance/types";

function account(overrides: Partial<Account> & Pick<Account, "id">): Account {
  return {
    type: "current_account",
    name: "Main",
    institution: "CIB",
    accountNumberLast4: "1234",
    currentBalance: 0,
    includeInNetWorth: true,
    includeInEmergencyFund: false,
    status: "active",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("sortAccountsByCreatedAtDesc", () => {
  it("orders newest account first", () => {
    const sorted = sortAccountsByCreatedAtDesc([
      account({ id: "a", createdAt: "2026-01-01T00:00:00.000Z" }),
      account({ id: "b", createdAt: "2026-06-01T00:00:00.000Z" }),
    ]);

    expect(sorted.map((item) => item.id)).toEqual(["b", "a"]);
  });
});

describe("account identity validation", () => {
  const context = {
    accounts: [
      account({
        id: "existing",
        name: "Salary",
        institution: "CIB",
        accountNumberLast4: "5678",
      }),
    ],
    certificates: [],
    creditCards: [],
    loans: [],
  };

  it("flags duplicate when name, institution, and number all match", () => {
    expect(
      findDuplicateAccountIdentity(
        { name: "Salary", institution: "CIB", numberLast4: "5678" },
        context,
      )?.id,
    ).toBe("existing");
  });

  it("allows same name and institution with different number", () => {
    expect(
      findDuplicateAccountIdentity(
        { name: "Salary", institution: "CIB", numberLast4: "9999" },
        context,
      ),
    ).toBeUndefined();
  });

  it("excludes the current account during edit", () => {
    expect(
      findDuplicateAccountIdentity(
        { name: "Salary", institution: "CIB", numberLast4: "5678" },
        context,
        "existing",
      ),
    ).toBeUndefined();
  });

  it("normalizes case and whitespace", () => {
    expect(
      normalizeAccountIdentity({
        name: "  Salary ",
        institution: " cib ",
        numberLast4: "5678",
      }),
    ).toEqual({
      name: "salary",
      institution: "cib",
      numberLast4: "5678",
    });
  });
});
