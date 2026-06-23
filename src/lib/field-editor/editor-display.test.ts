import { describe, expect, it } from "vitest";

import { stripFieldEditorUnitLabels } from "@/lib/field-editor/editor-display";

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
