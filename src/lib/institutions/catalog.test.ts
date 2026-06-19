import { describe, expect, it, vi } from "vitest";

import {
  formatInstitutionDisplay,
  formatInstitutionEntityLabel,
  formatInstitutionShortcut,
  getAllowedCategories,
  institutionMatchesSearch,
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
