import { describe, expect, it } from "vitest";

import {
  formatCurrency,
  formatMetricCurrency,
  formatSignedCurrency,
  getCurrencyDisplayParts,
} from "@/lib/format/currency-display";

describe("currency display", () => {
  it("formats amounts as EGP prefix without sign in unsigned mode", () => {
    expect(formatCurrency(5000, "en-EG")).toBe("EGP 5,000");
    expect(formatCurrency(-5000, "en-EG")).toBe("EGP 5,000");
  });

  it("formats dashboard metrics with explicit signs", () => {
    expect(formatMetricCurrency(5000, "en-EG")).toBe("+ EGP 5,000");
    expect(formatMetricCurrency(-5000, "en-EG")).toBe("− EGP 5,000");
  });

  it("formats fractional amounts with unified decimal typography", () => {
    const parts = getCurrencyDisplayParts(999999.99, "en-EG");
    expect(parts.integerText).toBe("999,999");
    expect(parts.decimalText).toBe(".99");
    expect(parts.fullText).toBe("EGP 999,999.99");
  });

  it("omits sign prefixes for record and balance displays", () => {
    expect(formatSignedCurrency(-250, "expense", "en-EG")).toBe("EGP 250");
    expect(formatSignedCurrency(250, "income", "en-EG")).toBe("EGP 250");
  });

  it("can hide decimals via options", () => {
    expect(
      getCurrencyDisplayParts(1500.5, "en-EG", { showDecimals: false }).fullText,
    ).toBe("EGP 1,501");
  });
});
