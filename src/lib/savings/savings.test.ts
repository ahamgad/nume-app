import { describe, expect, it } from "vitest";

import {
  isCreatableAccountType,
  parseCreatableAccountType,
} from "@/lib/finance/account-type-catalog";
import {
  calculateSavingsInterest,
  resolveEffectiveAnnualRate,
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

  it("accepts tiers that do not start at zero", () => {
    const tiers = parseTierRows([
      { minBalance: "50000", maxBalance: "100000", annualInterestRate: "15" },
      { minBalance: "100001", maxBalance: "", annualInterestRate: "18" },
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

  it("returns null when balance is below first tier minimum", () => {
    const tier = findTierForBalance(40000, [
      { minBalance: 50000, maxBalance: 100000, annualInterestRate: 15 },
      { minBalance: 100001, maxBalance: null, annualInterestRate: 18 },
    ]);
    expect(tier).toBeNull();
  });
});

describe("savings interest engine", () => {
  it("calculates simple interest from minimum balance", () => {
    expect(calculateSavingsInterest(100000, 12, "monthly")).toBe(1000);
  });

  it("calculates daily interest from minimum balance", () => {
    expect(calculateSavingsInterest(365000, 10, "daily")).toBe(100);
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

  it("returns null when cycle minimum is below first tier", () => {
    expect(
      resolveInterestRate("tiered", null, [
        {
          id: "1",
          savingsAccountId: "s",
          userId: "u",
          minBalance: 50000,
          maxBalance: null,
          annualInterestRate: 15,
          sortOrder: 0,
        },
      ], 40000),
    ).toBeNull();
  });

  it("resolves effective annual rate from current balance", () => {
    expect(
      resolveEffectiveAnnualRate("fixed", 12, [], 5000),
    ).toEqual({ rate: 12, belowMinimumTier: false });

    expect(
      resolveEffectiveAnnualRate("tiered", null, [
        {
          id: "1",
          savingsAccountId: "s",
          userId: "u",
          minBalance: 50001,
          maxBalance: 200000,
          annualInterestRate: 18,
          sortOrder: 0,
        },
      ], 75000),
    ).toEqual({ rate: 18, belowMinimumTier: false });

    expect(
      resolveEffectiveAnnualRate("tiered", null, [
        {
          id: "1",
          savingsAccountId: "s",
          userId: "u",
          minBalance: 50000,
          maxBalance: null,
          annualInterestRate: 15,
          sortOrder: 0,
        },
      ], 40000),
    ).toEqual({ rate: null, belowMinimumTier: true });
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

  it("computes daily posting dates", () => {
    expect(
      calculateInitialNextPostingDate("2026-01-10", "daily", 1),
    ).toBe("2026-01-11");
    expect(
      calculateNextPostingDateAfter("2026-01-11", "daily", 1),
    ).toBe("2026-01-12");
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
