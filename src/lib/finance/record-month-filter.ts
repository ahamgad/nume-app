import { endOfMonth, format, startOfMonth, subMonths } from "date-fns";

import type { FinanceRecord } from "@/lib/finance/types";

export type RecordMonthFilter = "this_month" | "last_month";

export function recordMonthFilterBounds(
  filter: RecordMonthFilter,
  referenceDate = new Date(),
): { start: string; end: string } {
  const anchor = filter === "last_month" ? subMonths(referenceDate, 1) : referenceDate;
  return {
    start: format(startOfMonth(anchor), "yyyy-MM-dd"),
    end: format(endOfMonth(anchor), "yyyy-MM-dd"),
  };
}

export function filterRecordsByMonth(
  records: FinanceRecord[],
  filter: RecordMonthFilter,
  referenceDate = new Date(),
): FinanceRecord[] {
  const { start, end } = recordMonthFilterBounds(filter, referenceDate);
  return records.filter((record) => record.date >= start && record.date <= end);
}
