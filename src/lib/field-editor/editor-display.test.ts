import { describe, expect, it } from "vitest";

import {
  isFieldEditorKeyboardSubmitKey,
  stripFieldEditorUnitLabels,
} from "@/lib/field-editor/editor-display";

describe("stripFieldEditorUnitLabels", () => {
  it("removes prefix and suffix unit labels from editor config", () => {
    expect(
      stripFieldEditorUnitLabels({
        label: "Rate",
        prefixLabel: "EGP",
        suffixLabel: "%",
      }),
    ).toEqual({
      label: "Rate",
      prefixLabel: undefined,
      suffixLabel: undefined,
    });
  });
});

describe("isFieldEditorKeyboardSubmitKey", () => {
  it("treats Enter and Return as submit", () => {
    expect(isFieldEditorKeyboardSubmitKey({ key: "Enter", shiftKey: false })).toBe(
      true,
    );
  });

  it("ignores Shift+Enter for newline", () => {
    expect(isFieldEditorKeyboardSubmitKey({ key: "Enter", shiftKey: true })).toBe(
      false,
    );
  });

  it("ignores other keys", () => {
    expect(isFieldEditorKeyboardSubmitKey({ key: "a", shiftKey: false })).toBe(
      false,
    );
  });
});
