import { findDueScheduleEntries } from "@/lib/certificates/schedule-generator";
import { evaluateMaturity } from "@/lib/certificates/recurring/maturity";
import type {
  ProcessCertificateInterestResult,
  ProcessDueEntryResult,
} from "@/lib/certificates/recurring/types";
import type {
  Certificate,
  CertificateScheduleEntry,
  CertificateStatus,
} from "@/lib/certificates/types";

export interface ProcessedEntrySnapshot {
  scheduleEntryId: string;
  interestAmount: number;
  transferAttempted: boolean;
  transferSucceeded: boolean;
  transferFailed: boolean;
}

/** Pure planning step — determines which entries are eligible without side effects. */
export function planInterestProcessing(
  certificate: Certificate,
  schedules: CertificateScheduleEntry[],
  asOfDate: string,
): CertificateScheduleEntry[] {
  if (certificate.status !== "active") return [];
  return findDueScheduleEntries(schedules, asOfDate);
}

export function buildProcessResult(
  certificateId: string,
  processedEntries: ProcessedEntrySnapshot[],
  nextStatus: CertificateStatus,
  originalStatus: CertificateStatus,
): ProcessCertificateInterestResult {
  return {
    certificateId,
    processedCount: processedEntries.length,
    matured: nextStatus === "matured",
    renewed: nextStatus === "renewed",
    closed: nextStatus === "closed",
    entries: processedEntries.map(
      (entry): ProcessDueEntryResult => ({
        scheduleEntryId: entry.scheduleEntryId,
        interestAmount: entry.interestAmount,
        transferAttempted: entry.transferAttempted,
        transferSucceeded: entry.transferSucceeded,
        transferFailed: entry.transferFailed,
      }),
    ),
  };
}

export function resolvePostProcessingStatus(
  certificate: Certificate,
  schedules: CertificateScheduleEntry[],
  asOfDate: string,
  renewalAlreadyProcessed: boolean,
): CertificateStatus {
  const evaluation = evaluateMaturity(certificate, schedules, asOfDate);
  if (!evaluation.shouldMature) return certificate.status;
  if (renewalAlreadyProcessed) return "renewed";
  if (evaluation.shouldClose) return "closed";
  if (evaluation.shouldRenew) return "matured";
  return "matured";
}
