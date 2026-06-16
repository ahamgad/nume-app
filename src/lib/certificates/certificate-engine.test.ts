import { describe, expect, it } from "vitest";

import {
  formatCertificateRemainingLabel,
  calculateRemainingDays,
} from "@/lib/certificates/certificate-engine";
import { isMissingRenewalTypeColumnError } from "@/lib/certificates/schema-support";

describe("formatCertificateRemainingLabel", () => {
  const t = (key: string, params?: Record<string, number>) => {
    if (key === "certificates.details.remainingYearsCount" && params) {
      return `${params.count} years`;
    }
    if (key === "certificates.details.remainingMonthsCount" && params) {
      return `${params.count} months`;
    }
    if (key === "certificates.details.remainingDaysCount" && params) {
      return `${params.count} days`;
    }
    if (key === "certificates.details.remainingDayCount") {
      return "1 day";
    }
    if (key === "certificates.details.remainingMonthCount") {
      return "1 month";
    }
    if (key === "certificates.details.remainingYearCount") {
      return "1 year";
    }
    return key;
  };

  it("shows days within the final month", () => {
    expect(
      formatCertificateRemainingLabel("2026-02-01", "2026-01-10", t),
    ).toBe("22 days");
  });

  it("shows months when more than 30 days remain", () => {
    expect(
      formatCertificateRemainingLabel("2026-06-15", "2026-01-10", t),
    ).toBe("5 months");
  });

  it("shows years for exact multi-year periods", () => {
    expect(
      formatCertificateRemainingLabel("2028-01-10", "2026-01-10", t),
    ).toBe("2 years");
  });
});

describe("schema-support", () => {
  it("detects missing renewal_type schema cache errors", () => {
    expect(
      isMissingRenewalTypeColumnError({
        message:
          "Could not find the 'renewal_type' column of 'certificates' in the schema cache",
        code: "PGRST204",
      }),
    ).toBe(true);
  });
});

describe("calculateRemainingDays", () => {
  it("never returns negative remaining days", () => {
    expect(calculateRemainingDays("2025-01-01", "2026-01-01")).toBe(0);
  });
});
