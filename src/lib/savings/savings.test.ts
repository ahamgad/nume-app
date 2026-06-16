import { describe, expect, it } from "vitest";

import {
  isCreatableAccountType,
  parseCreatableAccountType,
} from "@/lib/finance/account-type-catalog";
import {
  calculateSavingsInterest,
  resolveInterestRate,
} from "@/lib/savings/interest-engine";
import {
  calculateInitialNextPostingDate,
  calculateNextPostingDateAfter,
  isPostingDue,
  POSTING_DAY_LAST_OF_MONTH,
  parsePostingDayFromForm,
  postingDayToFormValue,
} from "@/lib/savings/posting-schedule";
import {
  findTierForBalance,
  parseTierRows,
  validateTierStructure,
} from "@/lib/savings/tier-validation";

const t = (key: string) => key;

describe("account-type-catalog", () => {
  it("allows enabled account types", () => {
    expect(isCreatableAccountType("savings_account")).toBe(true);
    expect(parseCreatableAccountType("savings_account")).toBe("savings_account");
  });

  it("rejects disabled account types", () => {
    expect(isCreatableAccountType("gold")).toBe(false);
    expect(parseCreatableAccountType("gold")).toBeNull();
  });
});

describe("savings tier validation", () => {
  it("accepts contiguous tiers ending open", () => {
    const tiers = parseTierRows([
      { minBalance: "0", maxBalance: "50000", annualInterestRate: "15" },
      { minBalance: "50001", maxBalance: "200000", annualInterestRate: "18" },
      { minBalance: "200001", maxBalance: "", annualInterestRate: "20" },
    ]);
    expect(tiers).not.toBeNull();
    expect(validateTierStructure(tiers!, t)).toEqual({});
  });

  it("rejects gaps between tiers", () => {
    const tiers = parseTierRows([
      { minBalance: "0", maxBalance: "100", annualInterestRate: "10" },
      { minBalance: "200", maxBalance: "", annualInterestRate: "12" },
    ]);
    expect(tiers).not.toBeNull();
    expect(validateTierStructure(tiers!, t).tiers).toBe(
      "savings.validation.tiersGap",
    );
  });

  it("uses single-tier logic for minimum balance", () => {
    const tier = findTierForBalance(75000, [
      { minBalance: 0, maxBalance: 50000, annualInterestRate: 15 },
      { minBalance: 50001, maxBalance: 200000, annualInterestRate: 18 },
      { minBalance: 200001, maxBalance: null, annualInterestRate: 20 },
    ]);
    expect(tier?.annualInterestRate).toBe(18);
  });
});

describe("savings interest engine", () => {
  it("calculates simple interest from minimum balance", () => {
    expect(calculateSavingsInterest(100000, 12, "monthly")).toBe(1000);
  });

  it("resolves fixed and tiered rates", () => {
    expect(resolveInterestRate("fixed", 10, [], 5000)).toBe(10);
    expect(
      resolveInterestRate("tiered", null, [
        {
          id: "1",
          savingsAccountId: "s",
          userId: "u",
          minBalance: 0,
          maxBalance: null,
          annualInterestRate: 14,
          sortOrder: 0,
        },
      ], 1000),
    ).toBe(14);
  });
});

describe("savings posting schedule", () => {
  it("computes initial and subsequent posting dates", () => {
    expect(
      calculateInitialNextPostingDate("2026-01-10", "monthly", 15),
    ).toBe("2026-01-15");
    expect(
      calculateNextPostingDateAfter("2026-01-15", "monthly", 15),
    ).toBe("2026-02-15");
  });

  it("resolves last day of month for February and longer months", () => {
    expect(
      calculateInitialNextPostingDate(
        "2026-01-15",
        "monthly",
        POSTING_DAY_LAST_OF_MONTH,
      ),
    ).toBe("2026-01-31");
    expect(
      calculateNextPostingDateAfter(
        "2026-01-31",
        "monthly",
        POSTING_DAY_LAST_OF_MONTH,
      ),
    ).toBe("2026-02-28");
    expect(
      calculateNextPostingDateAfter(
        "2024-01-31",
        "monthly",
        POSTING_DAY_LAST_OF_MONTH,
      ),
    ).toBe("2024-02-29");
  });

  it("maps form values for last day of month", () => {
    expect(parsePostingDayFromForm("last_day")).toBe(POSTING_DAY_LAST_OF_MONTH);
    expect(postingDayToFormValue(POSTING_DAY_LAST_OF_MONTH)).toBe("last_day");
  });

  it("detects due postings", () => {
    expect(isPostingDue("2026-01-01", "2026-01-15")).toBe(true);
    expect(isPostingDue("2026-02-01", "2026-01-15")).toBe(false);
  });
});
