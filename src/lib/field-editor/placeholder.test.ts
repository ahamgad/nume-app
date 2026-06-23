import { describe, expect, it } from "vitest";

import { sanitizeFieldEditorPlaceholder } from "@/lib/field-editor/placeholder";

describe("sanitizeFieldEditorPlaceholder", () => {
  it("returns undefined for empty input", () => {
    expect(sanitizeFieldEditorPlaceholder(undefined)).toBeUndefined();
    expect(sanitizeFieldEditorPlaceholder("")).toBeUndefined();
    expect(sanitizeFieldEditorPlaceholder("   ")).toBeUndefined();
  });

  it("passes through clean placeholders", () => {
    expect(sanitizeFieldEditorPlaceholder("Select institution")).toBe(
      "Select institution",
    );
    expect(sanitizeFieldEditorPlaceholder("0")).toBe("0");
    expect(sanitizeFieldEditorPlaceholder("Amount")).toBe("Amount");
  });

  it("removes parenthetical unit suffixes", () => {
    expect(sanitizeFieldEditorPlaceholder("Amount (EGP)")).toBe("Amount");
    expect(sanitizeFieldEditorPlaceholder("Rate (%)")).toBe("Rate");
  });

  it("removes trailing currency and percent tokens", () => {
    expect(sanitizeFieldEditorPlaceholder("0 EGP")).toBe("0");
    expect(sanitizeFieldEditorPlaceholder("Interest rate %")).toBe(
      "Interest rate",
    );
    expect(sanitizeFieldEditorPlaceholder("EGP 0")).toBe("0");
  });

  it("removes embedded percent in numeric placeholders", () => {
    expect(sanitizeFieldEditorPlaceholder("0%")).toBe("0");
    expect(sanitizeFieldEditorPlaceholder("%")).toBeUndefined();
    expect(sanitizeFieldEditorPlaceholder("EGP")).toBeUndefined();
  });
});
