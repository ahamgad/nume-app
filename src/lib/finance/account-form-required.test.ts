import { describe, expect, it } from "vitest";

import {
  isAccountFormFieldRequired,
  resolveAccountFormFieldRequired,
  type AccountFormRequirements,
} from "@/lib/finance/account-form-required";

describe("account form required fields", () => {
  const base: AccountFormRequirements = {
    mode: "create",
    accountType: "savings_account",
    showsInstitution: true,
    showsIdentifier: true,
    showsBalance: true,
  };

  it("marks only validation-required fields", () => {
    expect(isAccountFormFieldRequired("savings-name", base)).toBe(true);
    expect(isAccountFormFieldRequired("savings-institution", base)).toBe(true);
    expect(isAccountFormFieldRequired("savings-balance", base)).toBe(true);
    expect(isAccountFormFieldRequired("interestModel", base)).toBe(false);
  });

  it("requires annual rate only for fixed interest model", () => {
    expect(
      isAccountFormFieldRequired("savings-rate", {
        ...base,
        interestModel: "fixed",
      }),
    ).toBe(true);
    expect(
      isAccountFormFieldRequired("savings-rate", {
        ...base,
        interestModel: "tiered",
      }),
    ).toBe(false);
  });

  it("requires tier min and rate but not open-ended max balance", () => {
    const tiered = { ...base, interestModel: "tiered" as const };
    expect(isAccountFormFieldRequired("tier-min-0", tiered)).toBe(true);
    expect(isAccountFormFieldRequired("tier-rate-0", tiered)).toBe(true);
    expect(isAccountFormFieldRequired("tier-max-0", tiered)).toBe(false);
  });

  it("does not mark chip posting day fields as required", () => {
    expect(
      isAccountFormFieldRequired("savings-posting-day", {
        ...base,
        postingFrequency: "monthly",
      }),
    ).toBe(false);
    expect(
      isAccountFormFieldRequired("certificate-payout-day", {
        ...base,
        showsPayoutDay: true,
      }),
    ).toBe(false);
  });

  it("requires destination account only when transferring interest", () => {
    expect(
      isAccountFormFieldRequired("savings-destination", {
        ...base,
        interestDestination: "another_account",
      }),
    ).toBe(true);
    expect(
      isAccountFormFieldRequired("savings-destination", {
        ...base,
        interestDestination: "same_account",
      }),
    ).toBe(false);
  });

  it("does not require cash institution", () => {
    expect(
      isAccountFormFieldRequired("account-institution", {
        ...base,
        accountType: "cash",
      }),
    ).toBe(false);
  });

  it("honours explicit required overrides", () => {
    expect(resolveAccountFormFieldRequired("interestModel", base, false)).toBe(
      false,
    );
    expect(resolveAccountFormFieldRequired("interestModel", base, true)).toBe(
      true,
    );
  });
});
