import { describe, expect, it } from "vitest";

import {
  calculateNextPayoutDate,
  calculatePayoutAmount,
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

describe("daily payout frequency", () => {
  it("calculates per-day payout amount from annual rate", () => {
    expect(calculatePayoutAmount(100_000, 12, 12, "daily")).toBeCloseTo(32.88, 2);
  });

  it("returns the first daily payout on the day after purchase", () => {
    expect(
      calculateNextPayoutDate(
        "2026-01-15",
        "2027-01-15",
        "daily",
        "2026-01-15",
      ),
    ).toBe("2026-01-16");
  });

  it("advances daily payouts until on or after as-of date", () => {
    expect(
      calculateNextPayoutDate(
        "2026-01-15",
        "2027-01-15",
        "daily",
        "2026-01-20",
      ),
    ).toBe("2026-01-20");
  });
});
