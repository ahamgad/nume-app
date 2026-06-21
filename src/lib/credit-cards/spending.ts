import type { FinanceRecord } from "@/lib/finance/types";

/** Record types that count toward spending totals in reports. */
const SPENDING_RECORD_TYPES = new Set<FinanceRecord["type"]>([
  "credit_card_purchase",
  "expense",
]);

export function isSpendingRecord(
  record: Pick<FinanceRecord, "type">,
): boolean {
  return SPENDING_RECORD_TYPES.has(record.type);
}

/**
 * Sum of spending events. Credit card bill payments use `transfer` on the source
 * account and are excluded — only purchases and direct expenses count.
 */
export function calculateSpendingTotal(records: FinanceRecord[]): number {
  return records.reduce(
    (sum, record) =>
      isSpendingRecord(record) ? sum + Math.abs(record.amount) : sum,
    0,
  );
}
