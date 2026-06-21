import { describe, expect, it } from "vitest";

import {
  formatCurrency,
  formatSignedCurrency,
  getCurrencyDisplayParts,
} from "@/lib/format/currency-display";

describe("currency display", () => {
  it("formats amounts with E£ suffix and no negative sign", () => {
    expect(formatCurrency(5000, "en-EG")).toBe("5,000 E£");
    expect(formatCurrency(-5000, "en-EG")).toBe("5,000 E£");
  });

  it("formats fractional amounts with decimal typography parts", () => {
    const parts = getCurrencyDisplayParts(999999.99, "en-EG");
    expect(parts.integerText).toBe("999,999");
    expect(parts.decimalText).toBe(".99");
    expect(parts.fullText).toBe("999,999.99 E£");
  });

  it("omits sign prefixes for record amounts", () => {
    expect(formatSignedCurrency(-250, "expense", "en-EG")).toBe("250 E£");
    expect(formatSignedCurrency(250, "income", "en-EG")).toBe("250 E£");
  });

  it("can hide decimals via options", () => {
    expect(
      getCurrencyDisplayParts(1500.5, "en-EG", { showDecimals: false }).fullText,
    ).toBe("1,501 E£");
  });
});
