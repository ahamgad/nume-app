import { describe, expect, it } from "vitest";

import {
  filterRecordsByMonth,
  recordMonthFilterBounds,
} from "@/lib/finance/record-month-filter";
import type { FinanceRecord } from "@/lib/finance/types";

function record(date: string): FinanceRecord {
  return {
    id: `r-${date}`,
    accountId: "a1",
    type: "expense",
    amount: -10,
    description: null,
    date,
    certificateId: null,
    scheduleEntryId: null,
    savingsAccountId: null,
    creditCardId: null,
    paymentSourceAccountId: null,
    createdAt: `${date}T12:00:00.000Z`,
  };
}

describe("record month filter", () => {
  const referenceDate = new Date("2026-06-15T12:00:00.000Z");

  it("bounds this month and last month from a reference date", () => {
    expect(recordMonthFilterBounds("this_month", referenceDate)).toEqual({
      start: "2026-06-01",
      end: "2026-06-30",
    });
    expect(recordMonthFilterBounds("last_month", referenceDate)).toEqual({
      start: "2026-05-01",
      end: "2026-05-31",
    });
  });

  it("filters records by transaction date", () => {
    const records = [
      record("2026-06-02"),
      record("2026-05-30"),
      record("2026-04-30"),
    ];

    expect(filterRecordsByMonth(records, "this_month", referenceDate)).toEqual([
      records[0],
    ]);
    expect(filterRecordsByMonth(records, "last_month", referenceDate)).toEqual([
      records[1],
    ]);
  });
});
