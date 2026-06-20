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
    const banqueMisr = INSTITUTION_REGISTRY.find(
      (entry) => entry.id === "banque_misr",
    );
    expect(cib?.shortName).toBe("CIB");
    expect(cib?.fullName).toBe("Commercial International Bank");
    expect(nbe?.shortName).toBe("NBE");
    expect(nbe?.fullName).toBe("National Bank of Egypt");
    expect(aaib?.shortName).toBe("AAIB");
    expect(aaib?.fullName).toBe("Arab African International Bank");
    expect(banqueMisr?.shortName).toBe("Banque Misr");
    expect(banqueMisr?.fullName).toBe("Banque Misr");
  });

  it("uses current consumer-facing brand names", () => {
    const byId = (id: string) =>
      INSTITUTION_REGISTRY.find((entry) => entry.id === id);

    expect(byId("fab")).toMatchObject({
      shortName: "FABMISR",
      fullName: "FABMISR",
    });
    expect(byId("kfh")).toMatchObject({
      shortName: "KFH Egypt",
      fullName: "KFH Egypt",
    });
    expect(byId("etisalat_cash")).toMatchObject({
      shortName: "e& money",
      fullName: "e& money",
    });
    expect(byId("mnt_halan")).toMatchObject({
      shortName: "Halan",
      fullName: "Halan",
    });
    expect(byId("shahry")).toMatchObject({
      shortName: "TRU",
      fullName: "TRU",
    });
  });

  it("keeps legacy brand names in matchValues", () => {
    const byId = (id: string) =>
      INSTITUTION_REGISTRY.find((entry) => entry.id === id);

    expect(byId("etisalat_cash")?.matchValues).toContain("Etisalat Cash");
    expect(byId("kfh")?.matchValues).toContain("Ahli United Bank");
    expect(byId("fab")?.matchValues).toContain("FAB");
    expect(byId("shahry")?.matchValues).toContain("Shahry");
    expect(byId("mnt_halan")?.matchValues).toContain("MNT-Halan");
    expect(byId("saib")?.matchValues).toContain(
      "Société Arabe Internationale de Banque",
    );
  });
});
