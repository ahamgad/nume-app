import { describe, expect, it } from "vitest";

import {
  INSTITUTION_BRAND_ASSET_REGISTRY,
  getInstitutionBrandAssetEntry,
  getInstitutionBrandAssetPath,
} from "@/lib/institutions/brand-assets-registry";
import { validateInstitutionBrandAssetRegistry } from "@/lib/institutions/brand-assets-registry-validation";
import {
  INSTITUTION_REGISTRY,
  INSTITUTION_REGISTRY_BANKS,
  INSTITUTION_REGISTRY_FINANCIAL_SERVICES,
} from "@/lib/institutions/registry";

describe("institution brand assets registry", () => {
  it("passes validation with complete coverage and valid assets", () => {
    const result = validateInstitutionBrandAssetRegistry(
      INSTITUTION_BRAND_ASSET_REGISTRY,
    );
    expect(result.valid, JSON.stringify(result, null, 2)).toBe(true);
  });

  it("covers every institution in the main registry", () => {
    expect(INSTITUTION_BRAND_ASSET_REGISTRY).toHaveLength(
      INSTITUTION_REGISTRY.length,
    );
    expect(INSTITUTION_BRAND_ASSET_REGISTRY).toHaveLength(56);

    for (const entry of INSTITUTION_REGISTRY) {
      expect(getInstitutionBrandAssetEntry(entry.id)).toBeDefined();
    }
  });

  it("meets the 40+ recognizable asset target with minimal fallback", () => {
    const available = INSTITUTION_BRAND_ASSET_REGISTRY.filter(
      (entry) => entry.status === "available",
    );
    const fallback = INSTITUTION_BRAND_ASSET_REGISTRY.filter(
      (entry) => entry.status === "fallback",
    );
    const tierA = available.filter((entry) => entry.tier === "A");
    const tierB = available.filter((entry) => entry.tier === "B");
    const tierC = available.filter((entry) => entry.tier === "C");

    expect(available).toHaveLength(56);
    expect(tierA).toHaveLength(49);
    expect(tierB).toHaveLength(5);
    expect(tierC).toHaveLength(2);
    expect(fallback).toHaveLength(0);
    expect(tierA.length + tierB.length + tierC.length).toBe(available.length);
    expect(available.length + fallback.length).toBe(56);
  });

  it("maps available assets to unique public paths", () => {
    const paths = INSTITUTION_BRAND_ASSET_REGISTRY.filter(
      (entry) => entry.status === "available",
    ).map((entry) => entry.assetPath);

    expect(new Set(paths).size).toBe(paths.length);
    expect(getInstitutionBrandAssetPath("cib")).toMatch(/\/institutions\/cib\.png$/);
    expect(getInstitutionBrandAssetPath("contact")).toMatch(/\/institutions\/contact\.png$/);
    expect(getInstitutionBrandAssetPath("mid_bank")).toMatch(
      /\/institutions\/mid_bank\.png$/,
    );
    expect(getInstitutionBrandAssetPath("we_pay")).toMatch(
      /\/institutions\/we_cash\.png$/,
    );
  });

  it("aligns bank and financial service coverage with institution registry", () => {
    const bankAssets = INSTITUTION_BRAND_ASSET_REGISTRY.filter((entry) =>
      INSTITUTION_REGISTRY_BANKS.some((bank) => bank.id === entry.institutionId),
    );
    const fsAssets = INSTITUTION_BRAND_ASSET_REGISTRY.filter((entry) =>
      INSTITUTION_REGISTRY_FINANCIAL_SERVICES.some(
        (service) => service.id === entry.institutionId,
      ),
    );

    expect(bankAssets).toHaveLength(32);
    expect(fsAssets).toHaveLength(24);
  });
});
