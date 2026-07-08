import { describe, expect, it } from "vitest";

import { evaluateMaturity, computeRenewalPrincipal } from "@/lib/certificates/recurring/maturity";
import { planInterestProcessing } from "@/lib/certificates/recurring/processor-logic";
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
    maturityDate: "2027-01-01",
    payoutFrequency: "monthly",
    destinationAccountId: null,
    autoApply: false,
    status: "active",
    nextInterestDate: null,
    lastInterestProcessedAt: null,
    renewalType: "none",
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
  overrides: Partial<CertificateScheduleEntry>,
): CertificateScheduleEntry {
  return {
    id: overrides.id ?? "s1",
    certificateId: "cert-1",
    userId: "user-1",
    dueDate: "2026-02-01",
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

describe("maturity and processor logic", () => {
  it("plans only pending due entries for active certificates", () => {
    const entries = [
      scheduleEntry({ id: "due", dueDate: "2026-01-10", status: "pending" }),
      scheduleEntry({ id: "future", dueDate: "2026-06-01", status: "pending" }),
      scheduleEntry({ id: "done", dueDate: "2026-01-05", status: "processed" }),
    ];

    const planned = planInterestProcessing(certificate(), entries, "2026-02-01");
    expect(planned.map((entry) => entry.id)).toEqual(["due"]);
  });

  it("plans all overdue daily entries for catch-up processing", () => {
    const entries = [
      scheduleEntry({ id: "d1", dueDate: "2026-01-02", status: "pending" }),
      scheduleEntry({ id: "d2", dueDate: "2026-01-03", status: "pending" }),
      scheduleEntry({ id: "d3", dueDate: "2026-01-04", status: "pending" }),
      scheduleEntry({ id: "future", dueDate: "2026-01-10", status: "pending" }),
    ];

    const planned = planInterestProcessing(
      certificate({ payoutFrequency: "daily" }),
      entries,
      "2026-01-05",
    );
    expect(planned.map((entry) => entry.id)).toEqual(["d1", "d2", "d3"]);
  });

  it("evaluates maturity when all entries processed and maturity passed", () => {
    const entries = [
      scheduleEntry({ status: "processed", interestAmount: 1000 }),
      scheduleEntry({ id: "s2", status: "processed", interestAmount: 1000 }),
    ];

    const result = evaluateMaturity(
      certificate({ maturityDate: "2026-01-01", renewalType: "none" }),
      entries,
      "2026-02-01",
    );

    expect(result.shouldMature).toBe(true);
    expect(result.shouldClose).toBe(true);
  });

  it("computes renewal principal with earned interest", () => {
    expect(
      computeRenewalPrincipal(
        certificate({ renewalType: "renew_principal_and_interest" }),
        5000,
      ),
    ).toBe(105_000);
    expect(
      computeRenewalPrincipal(certificate({ renewalType: "renew_principal" }), 5000),
    ).toBe(100_000);
  });

  it("does not plan processing for inactive certificates", () => {
    expect(
      planInterestProcessing(
        certificate({ status: "closed" }),
        [scheduleEntry({})],
        "2026-02-01",
      ),
    ).toHaveLength(0);
  });
});
