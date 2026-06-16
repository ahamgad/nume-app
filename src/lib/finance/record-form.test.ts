import { describe, expect, it, vi } from "vitest";

import { validateRecordForm } from "@/lib/finance/record-form";

const t = vi.fn((key: string) => key);

describe("validateRecordForm transfer", () => {
  it("uses shared destination account validation key", () => {
    const errors = validateRecordForm(
      "transfer",
      {
        amount: "100",
        description: "",
        date: "2026-01-01",
        fromAccountId: "from-1",
        toAccountId: null,
      },
      t,
    );

    expect(errors.toAccountId).toBe(
      "accounts.validation.interestDestinationAccountRequired",
    );
  });
});
