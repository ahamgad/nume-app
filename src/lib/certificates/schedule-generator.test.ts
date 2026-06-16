import { describe, expect, it } from "vitest";

import {
  deriveNextInterestDate,
  findDueScheduleEntries,
  generateScheduleEntries,
  mergeScheduleRegeneration,
} from "@/lib/certificates/schedule-generator";
import type { CertificateScheduleEntry } from "@/lib/certificates/types";

const baseInput = {
  principalAmount: 100_000,
  annualInterestRate: 12,
  purchaseDate: "2026-01-15",
  termMonths: 12,
  maturityDate: "2027-01-15",
  payoutFrequency: "monthly" as const,
};

describe("schedule-generator", () => {
  it("generates monthly schedule entries through maturity", () => {
    const entries = generateScheduleEntries(baseInput);
    expect(entries.length).toBe(12);
    expect(entries[0]?.dueDate).toBe("2026-02-15");
    expect(entries.at(-1)?.dueDate).toBe("2027-01-15");
    expect(entries[0]?.interestAmount).toBe(1000);
  });

  it("generates a single at-maturity entry", () => {
    const entries = generateScheduleEntries({
      ...baseInput,
      payoutFrequency: "at_maturity",
    });
    expect(entries).toHaveLength(1);
    expect(entries[0]?.dueDate).toBe("2027-01-15");
    expect(entries[0]?.interestAmount).toBe(12_000);
  });

  it("preserves processed entries during regeneration", () => {
    const existing: CertificateScheduleEntry[] = [
      {
        id: "1",
        certificateId: "c1",
        userId: "u1",
        dueDate: "2026-02-15",
        interestAmount: 1000,
        status: "processed",
        processedAt: "2026-02-15T00:00:00Z",
        interestRecordId: "r1",
        transferFailed: false,
        transferRecordId: null,
        createdAt: "",
        updatedAt: "",
      },
    ];

    const regenerated = generateScheduleEntries(baseInput);
    const merged = mergeScheduleRegeneration(existing, regenerated);
    expect(merged.some((entry) => entry.dueDate === "2026-02-15")).toBe(false);
    expect(merged.length).toBe(11);
  });

  it("finds due pending entries on or before as-of date", () => {
    const schedules: CertificateScheduleEntry[] = [
      {
        id: "1",
        certificateId: "c1",
        userId: "u1",
        dueDate: "2026-02-15",
        interestAmount: 1000,
        status: "processed",
        processedAt: null,
        interestRecordId: null,
        transferFailed: false,
        transferRecordId: null,
        createdAt: "",
        updatedAt: "",
      },
      {
        id: "2",
        certificateId: "c1",
        userId: "u1",
        dueDate: "2026-03-15",
        interestAmount: 1000,
        status: "pending",
        processedAt: null,
        interestRecordId: null,
        transferFailed: false,
        transferRecordId: null,
        createdAt: "",
        updatedAt: "",
      },
    ];

    expect(findDueScheduleEntries(schedules, "2026-03-20")).toHaveLength(1);
    expect(deriveNextInterestDate(schedules, "2026-03-01")).toBe("2026-03-15");
  });
});
