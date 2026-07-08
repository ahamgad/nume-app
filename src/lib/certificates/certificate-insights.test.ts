import { describe, expect, it } from "vitest";

import {
  buildCertificateAccountNameKey,
  buildCertificateAccountNameLookup,
  computeCertificateInsights,
} from "@/lib/certificates/certificate-insights";
import type { Certificate, CertificateScheduleEntry } from "@/lib/certificates/types";

function certificate(overrides: Partial<Certificate> = {}): Certificate {
  return {
    id: "cert-1",
    userId: "user-1",
    accountId: "acct-1",
    principalAmount: 100_000,
    annualInterestRate: 12,
    purchaseDate: "2026-01-01",
    termMonths: 12,
    maturityDate: "2026-01-20",
    payoutFrequency: "monthly",
    destinationAccountId: null,
    autoApply: false,
    status: "active",
    nextInterestDate: null,
    lastInterestProcessedAt: null,
    renewalType: "renew_principal",
    renewedFromCertificateId: null,
    renewedCertificateId: null,
    sourceCertificateId: null,
    renewalProcessedAt: null,
    excludeWeekends: false,
    excludeEgyptianHolidays: false,
    certificateNumberLast4: null,
    payoutDay: 1,
    createdAt: "",
    updatedAt: "",
    ...overrides,
  };
}

function scheduleEntry(
  overrides: Partial<CertificateScheduleEntry> = {},
): CertificateScheduleEntry {
  return {
    id: "s1",
    certificateId: "cert-1",
    userId: "user-1",
    dueDate: "2026-01-10",
    interestAmount: 1000,
    status: "pending",
    processedAt: null,
    interestRecordId: null,
    transferFailed: false,
    transferRecordId: null,
    createdAt: "",
    updatedAt: "",
    ...overrides,
  };
}

describe("certificate-insights", () => {
  it("computes upcoming interest and auto-renewal flag", () => {
    const insights = computeCertificateInsights(
      [certificate()],
      [scheduleEntry()],
      buildCertificateAccountNameLookup([
        { id: "acct-1", name: "CD Account" },
      ]),
      "2026-01-01",
    );

    expect(insights.upcomingInterestAmount).toBe(1000);
    expect(insights.nextInterestDate).toBe("2026-01-10");
    expect(insights.upcomingInterestAutoRenewal).toBe(true);
    expect(insights.maturingSoon[0]?.name).toBe("CD Account");
  });

  it("builds stable account name keys for memoization", () => {
    const accounts = [
      { id: "b", name: "Beta" },
      { id: "a", name: "Alpha" },
    ];

    const keyOne = buildCertificateAccountNameKey(accounts);
    const keyTwo = buildCertificateAccountNameKey([
      { id: "a", name: "Alpha" },
      { id: "b", name: "Beta" },
    ]);

    expect(keyOne).toBe(keyTwo);
    expect(buildCertificateAccountNameLookup(accounts).get("a")).toBe("Alpha");
  });

  it("does not recompute maturing soon when only unrelated account fields change", () => {
    const accountNames = buildCertificateAccountNameLookup([
      { id: "acct-1", name: "CD Account" },
    ]);

    const first = computeCertificateInsights(
      [certificate()],
      [scheduleEntry({ dueDate: "2026-06-01" })],
      accountNames,
      "2026-01-01",
    );

    const second = computeCertificateInsights(
      [certificate()],
      [scheduleEntry({ dueDate: "2026-06-01" })],
      accountNames,
      "2026-01-01",
    );

    expect(first).toEqual(second);
    expect(first.maturingSoon).toHaveLength(1);
  });
});
