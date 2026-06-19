import { describe, expect, it } from "vitest";

import {
  isValidIdentifierLast4,
  parseOptionalIdentifierLast4,
  sanitizeIdentifierLast4Input,
} from "@/lib/finance/account-identifier";

describe("account-identifier", () => {
  it("accepts exactly four digits", () => {
    expect(isValidIdentifierLast4("1234")).toBe(true);
  });

  it("rejects invalid values", () => {
    expect(isValidIdentifierLast4("123")).toBe(false);
    expect(isValidIdentifierLast4("12345")).toBe(false);
    expect(isValidIdentifierLast4("ABCD")).toBe(false);
  });

  it("sanitizes non-digit input", () => {
    expect(sanitizeIdentifierLast4Input("12ab34")).toBe("1234");
    expect(sanitizeIdentifierLast4Input("123456")).toBe("1234");
  });

  it("returns null for empty optional input", () => {
    expect(parseOptionalIdentifierLast4("")).toBeNull();
    expect(parseOptionalIdentifierLast4("   ")).toBeNull();
  });

  it("throws for invalid optional input", () => {
    expect(() => parseOptionalIdentifierLast4("123")).toThrow();
  });
});
