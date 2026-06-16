import { addCalendarMonths } from "@/lib/certificates/certificate-engine";
import {
  calculateScheduleEntryInterest,
  roundCurrency,
} from "@/lib/certificates/interest-calculator";
import type {
  GeneratedScheduleEntry,
  ScheduleGenerationInput,
} from "@/lib/certificates/recurring/types";
import type { CertificateScheduleEntry, PayoutFrequency } from "@/lib/certificates/types";
import { validateGeneratedSchedule } from "@/lib/certificates/schedule-validation";

function frequencyStepMonths(frequency: PayoutFrequency): number | null {
  switch (frequency) {
    case "monthly":
      return 1;
    case "quarterly":
      return 3;
    case "semi_annual":
      return 6;
    case "annual":
      return 12;
    case "at_maturity":
    case "instantly":
      return null;
  }
}

/** Build the full projected schedule for a certificate configuration. */
export function generateScheduleEntries(
  input: ScheduleGenerationInput,
): GeneratedScheduleEntry[] {
  const { payoutFrequency, purchaseDate, maturityDate, termMonths } = input;

  if (payoutFrequency === "instantly") {
    const amount = calculateScheduleEntryInterest(
      input.principalAmount,
      input.annualInterestRate,
      payoutFrequency,
      termMonths,
    );
    if (amount <= 0) return [];
    return [{ dueDate: purchaseDate, interestAmount: amount }];
  }

  if (payoutFrequency === "at_maturity") {
    const amount = calculateScheduleEntryInterest(
      input.principalAmount,
      input.annualInterestRate,
      payoutFrequency,
      termMonths,
    );
    if (amount <= 0) return [];
    return [{ dueDate: maturityDate, interestAmount: amount }];
  }

  const stepMonths = frequencyStepMonths(payoutFrequency);
  if (stepMonths === null) return [];

  const perPeriodAmount = calculateScheduleEntryInterest(
    input.principalAmount,
    input.annualInterestRate,
    payoutFrequency,
    termMonths,
  );

  if (perPeriodAmount <= 0) return [];

  const entries: GeneratedScheduleEntry[] = [];
  let candidate = addCalendarMonths(purchaseDate, stepMonths);
  let guard = 0;
  const maxIterations = 600;

  while (candidate <= maturityDate && guard < maxIterations) {
    entries.push({
      dueDate: candidate,
      interestAmount: perPeriodAmount,
    });
    candidate = addCalendarMonths(candidate, stepMonths);
    guard += 1;
  }

  return entries;
}

/** Build and validate the full projected schedule for a certificate configuration. */
export function generateValidatedScheduleEntries(
  input: ScheduleGenerationInput,
): GeneratedScheduleEntry[] {
  const entries = generateScheduleEntries(input);
  return validateGeneratedSchedule(input, entries);
}

/** Merge regenerated pending entries while preserving processed/skipped history. */
export function mergeScheduleRegeneration(
  existing: CertificateScheduleEntry[],
  regenerated: GeneratedScheduleEntry[],
): GeneratedScheduleEntry[] {
  const lockedDates = new Set(
    existing
      .filter(
        (entry) => entry.status === "processed" || entry.status === "skipped",
      )
      .map((entry) => entry.dueDate),
  );

  return regenerated.filter((entry) => !lockedDates.has(entry.dueDate));
}

/** First pending schedule date on or after asOfDate, or null. */
export function deriveNextInterestDate(
  schedules: CertificateScheduleEntry[],
  asOfDate: string,
): string | null {
  const pending = schedules
    .filter((entry) => entry.status === "pending")
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  const upcoming = pending.find((entry) => entry.dueDate >= asOfDate);
  return upcoming?.dueDate ?? null;
}

/** Pending entries due on or before asOfDate, sorted chronologically. */
export function findDueScheduleEntries(
  schedules: CertificateScheduleEntry[],
  asOfDate: string,
): CertificateScheduleEntry[] {
  return schedules
    .filter(
      (entry) => entry.status === "pending" && entry.dueDate <= asOfDate,
    )
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
}

export function calculateScheduleSummary(
  schedules: CertificateScheduleEntry[],
): {
  totalExpectedInterest: number;
  totalProcessedInterest: number;
  remainingInterest: number;
} {
  const totalExpectedInterest = roundCurrency(
    schedules.reduce((sum, entry) => sum + entry.interestAmount, 0),
  );
  const totalProcessedInterest = roundCurrency(
    schedules
      .filter((entry) => entry.status === "processed")
      .reduce((sum, entry) => sum + entry.interestAmount, 0),
  );
  const remainingInterest = roundCurrency(
    schedules
      .filter((entry) => entry.status === "pending")
      .reduce((sum, entry) => sum + entry.interestAmount, 0),
  );

  return {
    totalExpectedInterest,
    totalProcessedInterest,
    remainingInterest,
  };
}

export function certificateInputFromCertificate(
  certificate: {
    principalAmount: number;
    annualInterestRate: number;
    purchaseDate: string;
    termMonths: number;
    maturityDate: string;
    payoutFrequency: PayoutFrequency;
  },
): ScheduleGenerationInput {
  return {
    principalAmount: certificate.principalAmount,
    annualInterestRate: certificate.annualInterestRate,
    purchaseDate: certificate.purchaseDate,
    termMonths: certificate.termMonths,
    maturityDate: certificate.maturityDate,
    payoutFrequency: certificate.payoutFrequency,
  };
}
