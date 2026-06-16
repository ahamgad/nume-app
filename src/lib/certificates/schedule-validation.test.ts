import { describe, expect, it } from "vitest";

import {
  hasDuplicateScheduleDates,
  isScheduleEntryAlreadyProcessed,
  ScheduleValidationError,
  validateGeneratedSchedule,
  validatePayoutFrequencyCombination,
} from "@/lib/certificates/schedule-validation";
import { generateScheduleEntries } from "@/lib/certificates/schedule-generator";

const baseInput = {
  principalAmount: 100_000,
  annualInterestRate: 12,
  purchaseDate: "2026-01-15",
  termMonths: 12,
  maturityDate: "2027-01-15",
  payoutFrequency: "monthly" as const,
};

describe("schedule-validation", () => {
  it("accepts valid generated schedules", () => {
    const entries = generateScheduleEntries(baseInput);
    expect(() => validateGeneratedSchedule(baseInput, entries)).not.toThrow();
    expect(entries.length).toBeGreaterThan(0);
  });

  it("rejects negative interest amounts", () => {
    expect(() =>
      validateGeneratedSchedule(baseInput, [
        { dueDate: "2026-02-15", interestAmount: -1 },
      ]),
    ).toThrow(ScheduleValidationError);
  });

  it("rejects duplicate schedule dates", () => {
    expect(() =>
      validateGeneratedSchedule(baseInput, [
        { dueDate: "2026-02-15", interestAmount: 1000 },
        { dueDate: "2026-02-15", interestAmount: 1000 },
      ]),
    ).toThrow(/Duplicate schedule date/);

    expect(
      hasDuplicateScheduleDates([
        { dueDate: "2026-02-15", interestAmount: 1000 },
        { dueDate: "2026-02-15", interestAmount: 1000 },
      ]),
    ).toBe(true);
  });

  it("rejects schedule entries after maturity", () => {
    expect(() =>
      validateGeneratedSchedule(baseInput, [
        { dueDate: "2027-02-15", interestAmount: 1000 },
      ]),
    ).toThrow(/after maturity/);
  });

  it("rejects empty schedules for paying certificates", () => {
    expect(() => validateGeneratedSchedule(baseInput, [])).toThrow(
      /produced no entries/,
    );
  });

  it("allows empty schedules for zero-rate certificates", () => {
    const zeroRateInput = { ...baseInput, annualInterestRate: 0 };
    expect(() => validateGeneratedSchedule(zeroRateInput, [])).not.toThrow();
  });

  it("rejects invalid payout frequency combinations", () => {
    expect(() =>
      validatePayoutFrequencyCombination({
        ...baseInput,
        termMonths: 0,
      }),
    ).toThrow(ScheduleValidationError);
  });
});

describe("processing idempotency helpers", () => {
  it("detects already processed schedule entries", () => {
    expect(isScheduleEntryAlreadyProcessed("pending")).toBe(false);
    expect(isScheduleEntryAlreadyProcessed("processed")).toBe(true);
    expect(isScheduleEntryAlreadyProcessed("skipped")).toBe(true);
  });
});
