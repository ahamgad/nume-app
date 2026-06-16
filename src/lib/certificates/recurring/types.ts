import type {
  Certificate,
  CertificateScheduleEntry,
  CertificateScheduleStatus,
  PayoutFrequency,
  RenewalType,
} from "@/lib/certificates/types";

export type { CertificateScheduleEntry, CertificateScheduleStatus, RenewalType };

/** Supported schedule frequencies (excludes instantly — handled separately). */
export const SCHEDULE_PAYOUT_FREQUENCIES: PayoutFrequency[] = [
  "daily",
  "monthly",
  "quarterly",
  "semi_annual",
  "annual",
  "at_maturity",
];

export interface ScheduleGenerationInput {
  principalAmount: number;
  annualInterestRate: number;
  purchaseDate: string;
  termMonths: number;
  maturityDate: string;
  payoutFrequency: PayoutFrequency;
}

export interface GeneratedScheduleEntry {
  dueDate: string;
  interestAmount: number;
}

export interface ScheduleSummary {
  totalExpectedInterest: number;
  totalProcessedInterest: number;
  remainingInterest: number;
}

export interface ProcessDueEntryResult {
  scheduleEntryId: string;
  interestAmount: number;
  transferAttempted: boolean;
  transferSucceeded: boolean;
  transferFailed: boolean;
}

export interface ProcessCertificateInterestResult {
  certificateId: string;
  processedCount: number;
  matured: boolean;
  renewed: boolean;
  closed: boolean;
  entries: ProcessDueEntryResult[];
}

export interface CertificateProcessingState {
  certificate: Certificate;
  schedules: CertificateScheduleEntry[];
  asOfDate: string;
}

export interface MaturityEvaluation {
  shouldMature: boolean;
  shouldRenew: boolean;
  shouldClose: boolean;
  renewalType: RenewalType;
  totalEarnedInterest: number;
}
