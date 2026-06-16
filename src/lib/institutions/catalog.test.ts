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
  };
  return labels[key] ?? key;
});

describe("formatInstitutionEntityLabel", () => {
  it("returns catalog shortcuts instead of full names", () => {
    expect(formatInstitutionEntityLabel("CIB", t)).toBe("CIB");
    expect(formatInstitutionEntityLabel("National Bank of Egypt", t)).toBe("NBE");
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
  it("matches full names during search even when display uses shortcuts", () => {
    expect(
      institutionMatchesSearch("CIB", "commercial international", t),
    ).toBe(true);
  });

  it("matches shortcuts", () => {
    expect(institutionMatchesSearch("National Bank of Egypt", "nbe", t)).toBe(
      true,
    );
  });
});
