import { describe, expect, it } from "vitest";

import { getInstitutionFallbackInitial } from "@/lib/institutions/logo-fallback";

describe("getInstitutionFallbackInitial", () => {
  it("returns the first alphanumeric character uppercased", () => {
    expect(getInstitutionFallbackInitial("CIB")).toBe("C");
    expect(getInstitutionFallbackInitial("NBE")).toBe("N");
    expect(getInstitutionFallbackInitial("Telda")).toBe("T");
    expect(getInstitutionFallbackInitial("OPay")).toBe("O");
    expect(getInstitutionFallbackInitial("valU")).toBe("V");
  });

  it("handles empty and custom institution labels", () => {
    expect(getInstitutionFallbackInitial("")).toBe("?");
    expect(getInstitutionFallbackInitial("My Local Bank")).toBe("M");
  });
});
