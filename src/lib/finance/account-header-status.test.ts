import { describe, expect, it } from "vitest";

import {
  getAccountHeaderStatusFromAccount,
  getAccountHeaderStatusFromCertificate,
  getAccountHeaderStatusLabelKey,
  getAccountHeaderStatusTone,
} from "@/lib/finance/account-header-status";

describe("account-header-status", () => {
  it("maps account status to header status", () => {
    expect(getAccountHeaderStatusFromAccount({ status: "active" })).toBe(
      "active",
    );
    expect(getAccountHeaderStatusFromAccount({ status: "archived" })).toBe(
      "archived",
    );
  });

  it("passes certificate status through unchanged", () => {
    expect(getAccountHeaderStatusFromCertificate("matured")).toBe("matured");
    expect(getAccountHeaderStatusFromCertificate("renewed")).toBe("renewed");
  });

  it("resolves label keys and tones", () => {
    expect(getAccountHeaderStatusLabelKey("active")).toBe("common.active");
    expect(getAccountHeaderStatusLabelKey("matured")).toBe(
      "certificates.status.matured",
    );
    expect(getAccountHeaderStatusTone("active")).toBe("positive");
    expect(getAccountHeaderStatusTone("closed")).toBe("inactive");
  });
});
