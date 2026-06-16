import type { ScheduleGenerationInput } from "@/lib/certificates/recurring/types";
import type { GeneratedScheduleEntry } from "@/lib/certificates/recurring/types";
import type { PayoutFrequency } from "@/lib/certificates/types";

export class ScheduleValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ScheduleValidationError";
  }
}

const PERIODIC_FREQUENCIES: PayoutFrequency[] = [
  "monthly",
  "quarterly",
  "semi_annual",
  "annual",
];

/** Validates payout frequency against certificate term constraints. */
export function validatePayoutFrequencyCombination(
  input: ScheduleGenerationInput,
): void {
  const { payoutFrequency, termMonths, purchaseDate, maturityDate } = input;

  if (purchaseDate > maturityDate) {
    throw new ScheduleValidationError(
      "Purchase date cannot be after maturity date",
    );
  }

  if (termMonths <= 0) {
    throw new ScheduleValidationError("Term must be positive");
  }

  if (payoutFrequency === "instantly" && termMonths < 1) {
    throw new ScheduleValidationError(
      "Instant payout requires a term of at least one month",
    );
  }

  if (
    PERIODIC_FREQUENCIES.includes(payoutFrequency) &&
    termMonths < 1
  ) {
    throw new ScheduleValidationError(
      "Periodic payout requires a term of at least one month",
    );
  }
}

/** Runtime safeguards before schedule persistence. Throws on invalid output. */
export function validateGeneratedSchedule(
  input: ScheduleGenerationInput,
  entries: GeneratedScheduleEntry[],
): GeneratedScheduleEntry[] {
  validatePayoutFrequencyCombination(input);

  const shouldProduceEntries =
    input.principalAmount > 0 && input.annualInterestRate > 0;

  if (shouldProduceEntries && entries.length === 0) {
    throw new ScheduleValidationError(
      "Schedule generation produced no entries for a paying certificate",
    );
  }

  const seenDates = new Set<string>();

  for (const entry of entries) {
    if (entry.interestAmount < 0) {
      throw new ScheduleValidationError(
        `Negative interest amount for ${entry.dueDate}`,
      );
    }

    if (seenDates.has(entry.dueDate)) {
      throw new ScheduleValidationError(
        `Duplicate schedule date: ${entry.dueDate}`,
      );
    }
    seenDates.add(entry.dueDate);

    if (entry.dueDate > input.maturityDate) {
      throw new ScheduleValidationError(
        `Schedule entry after maturity: ${entry.dueDate}`,
      );
    }

    if (entry.dueDate < input.purchaseDate) {
      throw new ScheduleValidationError(
        `Schedule entry before purchase date: ${entry.dueDate}`,
      );
    }
  }

  return entries;
}

/** Pure helper — detects duplicate dates in a generated batch. */
export function hasDuplicateScheduleDates(
  entries: GeneratedScheduleEntry[],
): boolean {
  const seen = new Set<string>();
  for (const entry of entries) {
    if (seen.has(entry.dueDate)) return true;
    seen.add(entry.dueDate);
  }
  return false;
}

/** Pure helper — whether an entry was already processed by another caller. */
export function isScheduleEntryAlreadyProcessed(
  status: "pending" | "processed" | "skipped",
): boolean {
  return status !== "pending";
}
