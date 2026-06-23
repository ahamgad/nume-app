import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  INPUT_FIELD_AMOUNT_PREFIX,
  INPUT_FIELD_DIVIDER_GAP_PX,
  INPUT_FIELD_ERROR_GAP_PX,
  INPUT_FIELD_LABEL_CLASS,
  INPUT_FIELD_LABEL_TO_CONTROL_GAP_PX,
  INPUT_FIELD_RATE_SUFFIX,
  INPUT_FIELD_ROW_TRIGGER_CLASS,
  INPUT_FIELD_VALUE_CLASS,
} from "@/lib/layout/input-field-chrome";

describe("input fields foundation", () => {
  it("freezes label, value, spacing, and decoration tokens", () => {
    expect(INPUT_FIELD_LABEL_TO_CONTROL_GAP_PX).toBe(8);
    expect(INPUT_FIELD_DIVIDER_GAP_PX).toBe(8);
    expect(INPUT_FIELD_ERROR_GAP_PX).toBe(4);
    expect(INPUT_FIELD_LABEL_CLASS).toContain("text-[0.8125rem]");
    expect(INPUT_FIELD_LABEL_CLASS).toContain("font-normal");
    expect(INPUT_FIELD_VALUE_CLASS).toContain("text-[0.9375rem]");
    expect(INPUT_FIELD_VALUE_CLASS).toContain("font-normal");
    expect(INPUT_FIELD_ROW_TRIGGER_CLASS).toContain("p-0");
    expect(INPUT_FIELD_AMOUNT_PREFIX).toBe("EGP");
    expect(INPUT_FIELD_RATE_SUFFIX).toBe("%");
  });

  it("uses shared input field shell and card chevron in row triggers", () => {
    const inputFieldSource = fs.readFileSync(
      path.join(process.cwd(), "src/components/forms/input-field.tsx"),
      "utf8",
    );
    const editableSource = fs.readFileSync(
      path.join(process.cwd(), "src/components/field-editor/editable-field.tsx"),
      "utf8",
    );

    expect(inputFieldSource).toContain("CardChevron");
    expect(inputFieldSource).toContain("InputFieldError");
    expect(editableSource).toContain("InputFieldRowTrigger");
    expect(editableSource).toContain("INPUT_FIELD_AMOUNT_PREFIX");
  });

  it("propagates through account form field modules", () => {
    const consumers = [
      "src/components/field-editor/editable-field.tsx",
      "src/components/ui/institution-picker.tsx",
      "src/components/ui/account-picker.tsx",
      "src/components/ui/date-field.tsx",
      "src/components/certificates/renewal-type-picker.tsx",
      "src/components/ui/scroll-chip-select.tsx",
    ];

    for (const consumerPath of consumers) {
      const source = fs.readFileSync(path.join(process.cwd(), consumerPath), "utf8");
      expect(source).toContain("InputField");
    }
  });
});
