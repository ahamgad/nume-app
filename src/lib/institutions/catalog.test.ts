import { describe, expect, it, vi } from "vitest";

import {
  formatInstitutionDisplay,
  formatInstitutionEntityLabel,
  formatInstitutionShortcut,
  getAllowedCategories,
  compareInstitutionsByShortName,
  INSTITUTION_BANKS,
  INSTITUTION_FINANCIAL_SERVICES,
  institutionMatchesSearch,
  resolveInstitutionBrandAssetProps,
} from "@/lib/institutions/catalog";

const t = vi.fn((key: string) => {
  const labels: Record<string, string> = {
    "institutions.banks.cib": "Commercial International Bank",
    "institutions.banks.banqueMisr": "Banque Misr",
    "institutions.banks.nbe": "National Bank of Egypt",
    "institutions.banks.qnbAlahli": "QNB Al Ahli",
  };
  return labels[key] ?? key;
});

describe("formatInstitutionEntityLabel", () => {
  it("returns catalog short names for known institutions", () => {
    expect(formatInstitutionEntityLabel("CIB", t)).toBe("CIB");
    expect(formatInstitutionEntityLabel("NBE", t)).toBe("NBE");
  });

  it("resolves legacy full names to short names", () => {
    expect(formatInstitutionEntityLabel("National Bank of Egypt", t)).toBe("NBE");
    expect(formatInstitutionEntityLabel("Commercial International Bank", t)).toBe(
      "CIB",
    );
    expect(formatInstitutionEntityLabel("Etisalat Cash", t)).toBe("e& money");
    expect(formatInstitutionEntityLabel("Shahry", t)).toBe("TRU");
    expect(formatInstitutionEntityLabel("MNT-Halan", t)).toBe("Halan");
    expect(formatInstitutionEntityLabel("FAB", t)).toBe("FABMISR");
    expect(formatInstitutionEntityLabel("KFH", t)).toBe("KFH Egypt");
  });

  it("returns custom values unchanged", () => {
    expect(formatInstitutionEntityLabel("Lucky", t)).toBe("Lucky");
  });

  it("matches formatInstitutionDisplay and formatInstitutionShortcut", () => {
    const value = "Banque Misr";
    expect(formatInstitutionDisplay(value, t)).toBe("Banque Misr");
    expect(formatInstitutionShortcut(value, t)).toBe("Banque Misr");
    expect(formatInstitutionDisplay(value, t)).not.toContain(" · ");
  });
});

describe("getAllowedCategories", () => {
  it("limits current accounts to banks only", () => {
    expect(getAllowedCategories("current_account")).toEqual(["bank"]);
  });

  it("includes banks and financial services for savings and certificates", () => {
    expect(getAllowedCategories("savings_account")).toEqual([
      "bank",
      "financial_service",
    ]);
    expect(getAllowedCategories("certificate")).toEqual([
      "bank",
      "financial_service",
    ]);
  });
});

describe("institutionMatchesSearch", () => {
  it("matches full names during search", () => {
    expect(
      institutionMatchesSearch("CIB", "commercial international", t),
    ).toBe(true);
  });

  it("matches legacy stored values", () => {
    expect(institutionMatchesSearch("QNB", "qnb alahli", t)).toBe(true);
  });

  it("matches short names and legacy full names", () => {
    expect(institutionMatchesSearch("NBE", "national bank", t)).toBe(true);
    expect(institutionMatchesSearch("National Bank of Egypt", "nbe", t)).toBe(
      true,
    );
  });
});

describe("institution catalog ordering", () => {
  it("sorts banks alphabetically by short name", () => {
    const names = INSTITUTION_BANKS.map((entry) => entry.shortcut);
    const sorted = [...names].sort((a, b) =>
      compareInstitutionsByShortName(
        { shortcut: a },
        { shortcut: b },
      ),
    );
    expect(names).toEqual(sorted);
    expect(names[0]).toBe("AAIB");
  });

  it("sorts financial services alphabetically by short name", () => {
    const names = INSTITUTION_FINANCIAL_SERVICES.map((entry) => entry.shortcut);
    const sorted = [...names].sort((a, b) =>
      compareInstitutionsByShortName(
        { shortcut: a },
        { shortcut: b },
      ),
    );
    expect(names).toEqual(sorted);
    expect(names[0]).toBe("Aman");
  });
});

describe("resolveInstitutionBrandAssetProps", () => {
  it("returns registry id and shortcut for catalog institutions", () => {
    expect(resolveInstitutionBrandAssetProps("CIB", t)).toEqual({
      institutionId: "cib",
      fallbackLabel: "CIB",
    });
  });

  it("returns null when institution is empty", () => {
    expect(resolveInstitutionBrandAssetProps("", t)).toBeNull();
    expect(resolveInstitutionBrandAssetProps(null, t)).toBeNull();
  });

  it("uses custom label for unknown institutions", () => {
    expect(resolveInstitutionBrandAssetProps("My Local Bank", t)).toEqual({
      institutionId: "My Local Bank",
      fallbackLabel: "My Local Bank",
    });
  });
});
