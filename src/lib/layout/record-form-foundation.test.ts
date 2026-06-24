import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

describe("record and activity form foundation", () => {
  it("aligns account type picker icon colors with action cards", () => {
    const typePickerCard = fs.readFileSync(
      path.join(
        process.cwd(),
        "src/components/accounts/account-type-picker-card.tsx",
      ),
      "utf8",
    );
    const actionCard = fs.readFileSync(
      path.join(
        process.cwd(),
        "src/components/accounts/account-action-picker-card.tsx",
      ),
      "utf8",
    );

    expect(typePickerCard).toContain("text-muted-foreground");
    expect(actionCard).toContain("text-muted-foreground");
  });

  it("uses account form section foundation on record forms", () => {
    const source = fs.readFileSync(
      path.join(
        process.cwd(),
        "src/components/records/record-form-fields.tsx",
      ),
      "utf8",
    );

    expect(source).toContain("AccountFormSection");
    expect(source).toContain("AccountFormEditableField");
    expect(source).toContain("AccountFormDateField");
    expect(source).not.toContain("common.optional");
    expect(source).not.toContain('label={`${descriptionLabel}');
  });

  it("removes account name from add record and activity screens", () => {
    for (const screen of [
      "add-record-form-screen.tsx",
      "add-credit-card-payment-screen.tsx",
      "add-credit-card-purchase-screen.tsx",
    ]) {
      const source = fs.readFileSync(
        path.join(process.cwd(), "src/components/screens", screen),
        "utf8",
      );

      expect(source).not.toContain("{account.name}");
    }
  });

  it("uses save button foundation on record and activity screens", () => {
    for (const screen of [
      "add-record-form-screen.tsx",
      "add-credit-card-payment-screen.tsx",
      "add-credit-card-purchase-screen.tsx",
    ]) {
      const source = fs.readFileSync(
        path.join(process.cwd(), "src/components/screens", screen),
        "utf8",
      );

      expect(source).toContain("FORM_PRIMARY_ACTION_BUTTON_CLASS");
      expect(source).toContain('t("common.save")');
      expect(source).toContain("disabled={submitting}");
      expect(source).not.toMatch(/disabled=\{submitting \|\|/);
    }
  });

  it("orders payment fields as amount, date, from account, description", () => {
    const source = fs.readFileSync(
      path.join(
        process.cwd(),
        "src/components/credit-cards/credit-card-payment-form-fields.tsx",
      ),
      "utf8",
    );

    const amountIndex = source.indexOf("cc-payment-amount");
    const dateIndex = source.indexOf("cc-payment-date");
    const accountIndex = source.indexOf("cc-payment-source-account");
    const descriptionIndex = source.indexOf("cc-payment-description");

    expect(amountIndex).toBeLessThan(dateIndex);
    expect(dateIndex).toBeLessThan(accountIndex);
    expect(accountIndex).toBeLessThan(descriptionIndex);
  });

  it("orders purchase fields as amount, date, description", () => {
    const source = fs.readFileSync(
      path.join(
        process.cwd(),
        "src/components/credit-cards/credit-card-purchase-form-fields.tsx",
      ),
      "utf8",
    );

    const amountIndex = source.indexOf("cc-purchase-amount");
    const dateIndex = source.indexOf("cc-purchase-date");
    const descriptionIndex = source.indexOf("cc-purchase-description");

    expect(amountIndex).toBeLessThan(dateIndex);
    expect(dateIndex).toBeLessThan(descriptionIndex);
  });

  it("marks required fields with explicit required indicators", () => {
    const recordSource = fs.readFileSync(
      path.join(
        process.cwd(),
        "src/components/records/record-form-fields.tsx",
      ),
      "utf8",
    );

    expect(recordSource).toContain("required\n");
    expect(recordSource).toContain("required={false}");
  });
});
