import { describe, expect, it } from "vitest";

import {
  calculateAtMaturityInterest,
  calculateDailyPeriodInterest,
  calculatePeriodInterest,
  calculateScheduleEntryInterest,
} from "@/lib/certificates/interest-calculator";

describe("interest-calculator", () => {
  it("calculates monthly period interest using simple interest formula", () => {
    expect(calculatePeriodInterest(120_000, 12, 1)).toBe(1200);
  });

  it("calculates quarterly period interest", () => {
    expect(calculatePeriodInterest(100_000, 12, 3)).toBe(3000);
  });

  it("calculates at-maturity interest across full term", () => {
    expect(calculateAtMaturityInterest(100_000, 10, 12)).toBe(10_000);
  });

  it("calculates schedule entry interest by frequency", () => {
    expect(
      calculateScheduleEntryInterest(100_000, 12, "monthly", 12),
    ).toBe(1000);
    expect(
      calculateScheduleEntryInterest(100_000, 12, "daily", 12),
    ).toBe(32.88);
    expect(
      calculateScheduleEntryInterest(100_000, 12, "at_maturity", 12),
    ).toBe(12_000);
  });

  it("calculates daily period interest using 365-day divisor", () => {
    expect(calculateDailyPeriodInterest(365_000, 10)).toBe(100);
  });
});
