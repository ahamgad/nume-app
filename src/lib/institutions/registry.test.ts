import { describe, expect, it } from "vitest";

import {
  INSTITUTION_REGISTRY,
  INSTITUTION_REGISTRY_BANKS,
  INSTITUTION_REGISTRY_FINANCIAL_SERVICES,
} from "@/lib/institutions/registry";
import { validateInstitutionRegistry } from "@/lib/institutions/registry-validation";
import {
  ALL_INSTITUTIONS,
  INSTITUTION_BANKS,
  INSTITUTION_FINANCIAL_SERVICES,
} from "@/lib/institutions/catalog";

describe("institution registry", () => {
  it("passes validation with no duplicates or conflicts", () => {
    const result = validateInstitutionRegistry(INSTITUTION_REGISTRY);
    expect(result.valid, JSON.stringify(result, null, 2)).toBe(true);
  });

  it("has expected category counts", () => {
    expect(INSTITUTION_REGISTRY_BANKS).toHaveLength(32);
    expect(INSTITUTION_REGISTRY_FINANCIAL_SERVICES).toHaveLength(25);
    expect(INSTITUTION_REGISTRY).toHaveLength(57);
  });

  it("derives catalog entries from registry without data loss", () => {
    expect(ALL_INSTITUTIONS).toHaveLength(INSTITUTION_REGISTRY.length);
    expect(INSTITUTION_BANKS).toHaveLength(INSTITUTION_REGISTRY_BANKS.length);
    expect(INSTITUTION_FINANCIAL_SERVICES).toHaveLength(
      INSTITUTION_REGISTRY_FINANCIAL_SERVICES.length,
    );

    for (const entry of INSTITUTION_REGISTRY) {
      const catalog = ALL_INSTITUTIONS.find((item) => item.id === entry.id);
      expect(catalog?.storageValue).toBe(entry.shortName);
      expect(catalog?.shortcut).toBe(entry.shortName);
      expect(catalog?.fullName).toBe(entry.fullName);
    }
  });

  it("uses shortName and fullName naming model", () => {
    const cib = INSTITUTION_REGISTRY.find((entry) => entry.id === "cib");
    const nbe = INSTITUTION_REGISTRY.find((entry) => entry.id === "nbe");
    const aaib = INSTITUTION_REGISTRY.find((entry) => entry.id === "aaib");
    expect(cib?.shortName).toBe("CIB");
    expect(cib?.fullName).toBe("Commercial International Bank");
    expect(nbe?.shortName).toBe("NBE");
    expect(nbe?.fullName).toBe("National Bank of Egypt");
    expect(aaib?.shortName).toBe("AAIB");
    expect(aaib?.fullName).toBe("Arab African International Bank");
  });
});
