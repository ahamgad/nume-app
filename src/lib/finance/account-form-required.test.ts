import { describe, expect, it } from "vitest";

import {
  isAccountFormFieldRequired,
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

  it("requires tier fields only for tiered interest model", () => {
    expect(
      isAccountFormFieldRequired("tier-min-0", {
        ...base,
        interestModel: "tiered",
      }),
    ).toBe(true);
    expect(
      isAccountFormFieldRequired("tier-min-0", {
        ...base,
        interestModel: "fixed",
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
});
