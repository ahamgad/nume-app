import { describe, expect, it } from "vitest";

import { hasCertificateRowUpdates } from "@/lib/certificates/update-certificate-logic";
import type { UpdateCertificateInput } from "@/lib/certificates/types";

describe("update-certificate-logic", () => {
  it("skips certificate row updates for account settings-only input", () => {
    expect(
      hasCertificateRowUpdates({
        includeInNetWorth: false,
      } satisfies UpdateCertificateInput),
    ).toBe(false);
    expect(
      hasCertificateRowUpdates({
        includeInEmergencyFund: true,
      } satisfies UpdateCertificateInput),
    ).toBe(false);
  });

  it("requires certificate row updates for certificate field changes", () => {
    expect(
      hasCertificateRowUpdates({
        renewalType: "renew_principal",
      }),
    ).toBe(true);
    expect(
      hasCertificateRowUpdates({
        principalAmount: 50_000,
      }),
    ).toBe(true);
  });
});
