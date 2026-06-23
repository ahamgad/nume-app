import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  ACCOUNT_FORM_DESCRIPTION_TO_SECTION_GAP_PX,
  ACCOUNT_FORM_FIELD_ROW_CLASS,
  ACCOUNT_FORM_SECTION_GAP_PX,
  ACCOUNT_FORM_SECTION_TITLE_CLASS,
} from "@/lib/layout/account-form-chrome";

describe("account forms foundation", () => {
  it("freezes spacing and section title tokens", () => {
    expect(ACCOUNT_FORM_DESCRIPTION_TO_SECTION_GAP_PX).toBe(16);
    expect(ACCOUNT_FORM_SECTION_GAP_PX).toBe(24);
    expect(ACCOUNT_FORM_SECTION_TITLE_CLASS).toContain("text-lg");
    expect(ACCOUNT_FORM_SECTION_TITLE_CLASS).toContain("font-medium");
  });

  it("uses 8px field row padding for divider rhythm", () => {
    expect(ACCOUNT_FORM_FIELD_ROW_CLASS).toContain("py-2");
  });

  it("uses card surface and shared section component", () => {
    const sectionSource = fs.readFileSync(
      path.join(process.cwd(), "src/components/forms/account-form-section.tsx"),
      "utf8",
    );

    expect(sectionSource).toContain("CARD_SURFACE_CLASS");
    expect(sectionSource).toContain("ACCOUNT_FORM_SECTION_TITLE_CLASS");
    expect(sectionSource).not.toContain("shadow-none");
  });

  it("propagates through all account form field modules", () => {
    const modules = [
      "src/components/accounts/money-account-form-fields.tsx",
      "src/components/accounts/lending-account-form-fields.tsx",
      "src/components/accounts/credit-card-form-fields.tsx",
      "src/components/savings/savings-form-fields.tsx",
      "src/components/certificates/certificate-form-fields.tsx",
    ];

    for (const modulePath of modules) {
      const source = fs.readFileSync(path.join(process.cwd(), modulePath), "utf8");
      expect(source).toContain("AccountFormSection");
      expect(source).toContain("AccountFormSections");
      expect(source).not.toContain("FormCardSection");
    }
  });
});
