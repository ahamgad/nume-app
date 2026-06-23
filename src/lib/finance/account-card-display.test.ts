import { describe, expect, it } from "vitest";

import { formatAccountCardInstituteRow } from "@/lib/finance/account-card-display";

const t = (key: string) => {
  const labels: Record<string, string> = {
    "accounts.types.cash": "Cash",
    "institutions.nbe": "NBE",
  };
  return labels[key] ?? key;
};

describe("formatAccountCardInstituteRow", () => {
  it("formats institution and last four", () => {
    expect(
      formatAccountCardInstituteRow(
        { type: "current_account", institution: "nbe" },
        "1234",
        t,
      ),
    ).toBe("NBE · 1234");
  });

  it("falls back to account type when no institution subtitle", () => {
    expect(
      formatAccountCardInstituteRow(
        { type: "cash", institution: null },
        null,
        t,
      ),
    ).toBe("Cash");
  });
});
