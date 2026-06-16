import { calculateRemainingDays } from "@/lib/certificates/certificate-engine";
import { findDueScheduleEntries } from "@/lib/certificates/schedule-generator";
import type { CertificateInsights } from "@/lib/certificates/types";
import type { Certificate, CertificateScheduleEntry } from "@/lib/certificates/types";
import { todayIsoDate } from "@/lib/format/date";

export function buildCertificateAccountNameKey(
  accounts: Array<{ id: string; name: string }>,
): string {
  return accounts
    .map((account) => `${account.id}:${account.name}`)
    .sort()
    .join("|");
}

const MATURING_SOON_DAYS = 30;

export function buildCertificateAccountNameLookup(
  accounts: Array<{ id: string; name: string }>,
): ReadonlyMap<string, string> {
  return new Map(accounts.map((account) => [account.id, account.name]));
}

export function computeCertificateInsights(
  certificates: Certificate[],
  schedules: CertificateScheduleEntry[],
  accountNames: ReadonlyMap<string, string>,
  asOfDate: string = todayIsoDate(),
): CertificateInsights {
  const schedulesByCertificate = new Map<string, CertificateScheduleEntry[]>();
  for (const entry of schedules) {
    const list = schedulesByCertificate.get(entry.certificateId) ?? [];
    list.push(entry);
    schedulesByCertificate.set(entry.certificateId, list);
  }

  const activeCertificates = certificates.filter(
    (certificate) => certificate.status === "active",
  );

  let upcomingInterestAmount: number | null = null;
  let nextInterestDate: string | null = null;
  let upcomingInterestAutoRenewal = false;

  for (const certificate of activeCertificates) {
    const certSchedules = schedulesByCertificate.get(certificate.id) ?? [];
    const pending = certSchedules
      .filter((entry) => entry.status === "pending")
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
    const next = pending.find((entry) => entry.dueDate >= asOfDate);
    if (!next) continue;
    if (!nextInterestDate || next.dueDate < nextInterestDate) {
      nextInterestDate = next.dueDate;
      upcomingInterestAmount = next.interestAmount;
      upcomingInterestAutoRenewal = certificate.renewalType !== "none";
    }
  }

  const maturingSoon = activeCertificates
    .map((certificate) => {
      const daysUntilMaturity = calculateRemainingDays(
        certificate.maturityDate,
        asOfDate,
      );
      return {
        certificateId: certificate.id,
        accountId: certificate.accountId,
        name: accountNames.get(certificate.accountId) ?? "",
        maturityDate: certificate.maturityDate,
        daysUntilMaturity,
        renewalType: certificate.renewalType,
      };
    })
    .filter(
      (item) =>
        item.daysUntilMaturity >= 0 &&
        item.daysUntilMaturity <= MATURING_SOON_DAYS,
    )
    .sort((a, b) => a.daysUntilMaturity - b.daysUntilMaturity);

  return {
    upcomingInterestAmount,
    nextInterestDate,
    upcomingInterestAutoRenewal,
    maturingSoon,
  };
}

export function getCertificateSchedules(
  schedules: CertificateScheduleEntry[],
  certificateId: string,
): CertificateScheduleEntry[] {
  return schedules
    .filter((entry) => entry.certificateId === certificateId)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
}

export function countDueEntries(
  schedules: CertificateScheduleEntry[],
  certificateId: string,
  asOfDate: string = todayIsoDate(),
): number {
  return findDueScheduleEntries(
    schedules.filter((entry) => entry.certificateId === certificateId),
    asOfDate,
  ).length;
}
