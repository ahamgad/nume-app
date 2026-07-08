import { describe, expect, it } from "vitest";

import { mapCertificate, type DbCertificate } from "@/lib/certificates/mappers";
import { buildProcessResult } from "@/lib/certificates/recurring/processor-logic";
import { isScheduleEntryAlreadyProcessed } from "@/lib/certificates/schedule-validation";

describe("processing concurrency guards", () => {
  it("returns zero processed count for repeated no-op processing", () => {
    const result = buildProcessResult("cert-1", [], "active", "active");
    expect(result.processedCount).toBe(0);
    expect(result.entries).toHaveLength(0);
  });

  it("treats already processed entries as non-actionable", () => {
    expect(isScheduleEntryAlreadyProcessed("processed")).toBe(true);
    expect(isScheduleEntryAlreadyProcessed("pending")).toBe(false);
  });

  it("maps renewal traceability fields from database rows", () => {
    const row = {
      id: "new-cert",
      user_id: "user-1",
      account_id: "acct-new",
      principal_amount: 100_000,
      annual_interest_rate: 12,
      purchase_date: "2027-01-01",
      term_months: 12,
      maturity_date: "2028-01-01",
      payout_frequency: "monthly",
      destination_account_id: null,
      auto_apply: false,
      status: "active",
      next_interest_date: null,
      last_interest_processed_at: null,
      renewal_type: "renew_principal",
      renewed_from_certificate_id: "old-cert",
      renewed_certificate_id: null,
      source_certificate_id: "old-cert",
      renewal_processed_at: null,
      exclude_weekends: false,
      exclude_egyptian_holidays: false,
      certificate_number_last4: null,
      payout_day: 1,
      created_at: "",
      updated_at: "",
    } satisfies DbCertificate;

    const mapped = mapCertificate(row);
    expect(mapped.sourceCertificateId).toBe("old-cert");
    expect(mapped.renewedFromCertificateId).toBe("old-cert");
  });

  it("maps renewed certificate reference on source certificate rows", () => {
    const row = {
      id: "old-cert",
      user_id: "user-1",
      account_id: "acct-old",
      principal_amount: 100_000,
      annual_interest_rate: 12,
      purchase_date: "2026-01-01",
      term_months: 12,
      maturity_date: "2027-01-01",
      payout_frequency: "monthly",
      destination_account_id: null,
      auto_apply: false,
      status: "renewed",
      next_interest_date: null,
      last_interest_processed_at: null,
      renewal_type: "renew_principal",
      renewed_from_certificate_id: null,
      renewed_certificate_id: "new-cert",
      source_certificate_id: null,
      renewal_processed_at: "2027-01-01T00:00:00Z",
      exclude_weekends: false,
      exclude_egyptian_holidays: false,
      certificate_number_last4: null,
      payout_day: 1,
      created_at: "",
      updated_at: "",
    } satisfies DbCertificate;

    const mapped = mapCertificate(row);
    expect(mapped.renewedCertificateId).toBe("new-cert");
    expect(mapped.status).toBe("renewed");
  });
});
