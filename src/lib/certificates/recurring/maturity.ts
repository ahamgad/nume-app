import { calculateScheduleSummary } from "@/lib/certificates/schedule-generator";
import type { MaturityEvaluation } from "@/lib/certificates/recurring/types";
import type {
  Certificate,
  CertificateScheduleEntry,
  CertificateStatus,
  RenewalType,
} from "@/lib/certificates/types";
import { todayIsoDate } from "@/lib/format/date";

const TERMINAL_STATUSES = new Set<CertificateStatus>([
  "matured",
  "renewed",
  "closed",
  "archived",
]);

export function isTerminalCertificateStatus(status: CertificateStatus): boolean {
  return TERMINAL_STATUSES.has(status);
}

export function evaluateMaturity(
  certificate: Certificate,
  schedules: CertificateScheduleEntry[],
  asOfDate: string = todayIsoDate(),
): MaturityEvaluation {
  const summary = calculateScheduleSummary(schedules);
  const allProcessed =
    schedules.length > 0 &&
    schedules.every(
      (entry) => entry.status === "processed" || entry.status === "skipped",
    );
  const maturityPassed = certificate.maturityDate <= asOfDate;
  const shouldMature =
    certificate.status === "active" && allProcessed && maturityPassed;

  return {
    shouldMature,
    shouldRenew: shouldMature && certificate.renewalType !== "none",
    shouldClose: shouldMature && certificate.renewalType === "none",
    renewalType: certificate.renewalType,
    totalEarnedInterest: summary.totalProcessedInterest,
  };
}

export function computeRenewalPrincipal(
  certificate: Certificate,
  totalEarnedInterest: number,
): number {
  if (certificate.renewalType === "renew_principal_and_interest") {
    return certificate.principalAmount + totalEarnedInterest;
  }
  return certificate.principalAmount;
}

export function isRenewalTypeAllowed(
  status: CertificateStatus,
  renewalType: RenewalType,
): boolean {
  if (isTerminalCertificateStatus(status) && status !== "active") {
    return renewalType === "none";
  }
  return true;
}
