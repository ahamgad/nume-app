import { describe, expect, it } from "vitest";

import { formatAccountCardInstituteRow } from "@/lib/finance/account-card-display";

const t = (key: string) => {
  const labels: Record<string, string> = {
    "accounts.types.cash": "Cash",
    "accounts.types.currentAccount": "Current",
    "accounts.types.savingsAccount": "Savings",
    "accounts.types.creditCard": "Credit",
  };
  return labels[key] ?? key;
};

describe("formatAccountCardInstituteRow", () => {
  it("formats account type and last four", () => {
    expect(
      formatAccountCardInstituteRow({ type: "current_account" }, "1234", t),
    ).toBe("Current · 1234");
  });

  it("formats account type only when no last four", () => {
    expect(
      formatAccountCardInstituteRow({ type: "cash" }, null, t),
    ).toBe("Cash");
  });

  it("ignores institution — type label is canonical", () => {
    expect(
      formatAccountCardInstituteRow({ type: "savings_account" }, "5678", t),
    ).toBe("Savings · 5678");
  });
});
