import { describe, expect, it } from "vitest";

import {
  canConfigureRelationshipSource,
  getAllowedSourceTypes,
  validateRelationshipAccounts,
} from "@/lib/finance/account-relationships/validation";

describe("account relationship validation", () => {
  it("defines allowed source types per relationship", () => {
    expect(getAllowedSourceTypes("interest_destination")).toEqual([
      "savings_account",
      "certificate",
    ]);
    expect(getAllowedSourceTypes("credit_card_payment_source")).toEqual([
      "credit_card",
    ]);
    expect(getAllowedSourceTypes("loan_payment_source")).toEqual(["loan"]);
  });

  it("rejects self-linking", () => {
    expect(() =>
      validateRelationshipAccounts(
        { id: "a", type: "credit_card", status: "active" },
        { id: "a", type: "current_account", status: "active" },
        "credit_card_payment_source",
      ),
    ).toThrow(/same account/);
  });

  it("rejects archived accounts", () => {
    expect(() =>
      validateRelationshipAccounts(
        { id: "cc", type: "credit_card", status: "archived" },
        { id: "ca", type: "current_account", status: "active" },
        "credit_card_payment_source",
      ),
    ).toThrow(/Source account must be active/);

    expect(() =>
      validateRelationshipAccounts(
        { id: "cc", type: "credit_card", status: "active" },
        { id: "ca", type: "current_account", status: "archived" },
        "credit_card_payment_source",
      ),
    ).toThrow(/Target account must be active/);
  });

  it("rejects invalid source types for relationship kind", () => {
    expect(() =>
      validateRelationshipAccounts(
        { id: "ca", type: "current_account", status: "active" },
        { id: "cash", type: "cash", status: "active" },
        "credit_card_payment_source",
      ),
    ).toThrow(/Source account type cannot configure/);

    expect(canConfigureRelationshipSource(
      { type: "loan" },
      "loan_payment_source",
    )).toBe(true);
    expect(canConfigureRelationshipSource(
      { type: "current_account" },
      "loan_payment_source",
    )).toBe(false);
  });

  it("rejects wealth-only target accounts", () => {
    expect(() =>
      validateRelationshipAccounts(
        { id: "loan", type: "loan", status: "active" },
        { id: "cert", type: "certificate", status: "active" },
        "loan_payment_source",
      ),
    ).toThrow(/cannot receive transfers/);
  });

  it("accepts valid credit card payment source pairing", () => {
    expect(() =>
      validateRelationshipAccounts(
        { id: "cc", type: "credit_card", status: "active" },
        { id: "ca", type: "current_account", status: "active" },
        "credit_card_payment_source",
      ),
    ).not.toThrow();
  });

  it("accepts valid interest destination pairing", () => {
    expect(() =>
      validateRelationshipAccounts(
        { id: "sav", type: "savings_account", status: "active" },
        { id: "ca", type: "current_account", status: "active" },
        "interest_destination",
      ),
    ).not.toThrow();
  });
});
