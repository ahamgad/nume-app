import { describe, expect, it } from "vitest";

import {
  INSTITUTION_LOGO_REGISTRY,
  getInstitutionLogoEntry,
  getInstitutionLogoPath,
} from "@/lib/institutions/logo-registry";
import { validateInstitutionLogoRegistry } from "@/lib/institutions/logo-registry-validation";
import {
  INSTITUTION_REGISTRY,
  INSTITUTION_REGISTRY_BANKS,
  INSTITUTION_REGISTRY_FINANCIAL_SERVICES,
} from "@/lib/institutions/registry";

describe("institution logo registry", () => {
  it("passes validation with complete coverage and valid assets", () => {
    const result = validateInstitutionLogoRegistry(INSTITUTION_LOGO_REGISTRY);
    expect(result.valid, JSON.stringify(result, null, 2)).toBe(true);
  });

  it("covers every institution in the main registry", () => {
    expect(INSTITUTION_LOGO_REGISTRY).toHaveLength(INSTITUTION_REGISTRY.length);
    expect(INSTITUTION_LOGO_REGISTRY).toHaveLength(57);

    for (const entry of INSTITUTION_REGISTRY) {
      expect(getInstitutionLogoEntry(entry.id)).toBeDefined();
    }
  });

  it("has expected available and fallback counts", () => {
    const available = INSTITUTION_LOGO_REGISTRY.filter(
      (entry) => entry.status === "available",
    );
    const fallback = INSTITUTION_LOGO_REGISTRY.filter(
      (entry) => entry.status === "fallback",
    );

    expect(available).toHaveLength(38);
    expect(fallback).toHaveLength(19);
    expect(available.length + fallback.length).toBe(57);
  });

  it("maps available logos to unique public paths", () => {
    const paths = INSTITUTION_LOGO_REGISTRY.filter(
      (entry) => entry.status === "available",
    ).map((entry) => entry.logoPath);

    expect(new Set(paths).size).toBe(paths.length);
    expect(getInstitutionLogoPath("cib")).toBe("/institutions/cib.svg");
    expect(getInstitutionLogoPath("telda")).toBeNull();
  });

  it("aligns bank and financial service coverage with institution registry", () => {
    const bankLogos = INSTITUTION_LOGO_REGISTRY.filter((entry) =>
      INSTITUTION_REGISTRY_BANKS.some((bank) => bank.id === entry.institutionId),
    );
    const fsLogos = INSTITUTION_LOGO_REGISTRY.filter((entry) =>
      INSTITUTION_REGISTRY_FINANCIAL_SERVICES.some(
        (service) => service.id === entry.institutionId,
      ),
    );

    expect(bankLogos).toHaveLength(32);
    expect(fsLogos).toHaveLength(25);
  });
});
