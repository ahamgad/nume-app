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

  it("never marks optional last-4 identifier fields as required", () => {
    expect(isAccountFormFieldRequired("account-number-last4", base)).toBe(false);
    expect(isAccountFormFieldRequired("savings-account-number", base)).toBe(false);
    expect(isAccountFormFieldRequired("lending-identifier", base)).toBe(false);
    expect(isAccountFormFieldRequired("credit-card-identifier", base)).toBe(false);
    expect(isAccountFormFieldRequired("certificate-number", base)).toBe(false);
    expect(
      isAccountFormFieldRequired("account-number-last4", {
        ...base,
        showsIdentifier: true,
      }),
    ).toBe(false);
  });

  it("requires annual rate for fixed savings and certificates", () => {
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
    expect(
      isAccountFormFieldRequired("certificate-rate", {
        accountType: "certificate",
      }),
    ).toBe(true);
  });

  it("requires tier min and rate but not open-ended max balance", () => {
    const tiered = { ...base, interestModel: "tiered" as const };
    expect(isAccountFormFieldRequired("tier-min-0", tiered)).toBe(true);
    expect(isAccountFormFieldRequired("tier-rate-0", tiered)).toBe(true);
    expect(isAccountFormFieldRequired("tier-max-0", tiered)).toBe(false);
  });

  it("does not mark chip posting or payout day fields as required", () => {
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
    expect(
      isAccountFormFieldRequired("credit-card-statement-due-day", base),
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
    expect(
      isAccountFormFieldRequired("certificate-interest-destination", {
        accountType: "certificate",
        autoApplyInterest: true,
      }),
    ).toBe(true);
    expect(
      isAccountFormFieldRequired("certificate-interest-destination", {
        accountType: "certificate",
        autoApplyInterest: false,
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

  it("ignores explicit required=true — validation registry is source of truth", () => {
    expect(
      resolveAccountFormFieldRequired("savings-account-number", base, true),
    ).toBe(false);
    expect(resolveAccountFormFieldRequired("interestModel", base, true)).toBe(
      false,
    );
  });

  it("honours explicit required=false override", () => {
    expect(resolveAccountFormFieldRequired("savings-name", base, false)).toBe(
      false,
    );
  });
});
