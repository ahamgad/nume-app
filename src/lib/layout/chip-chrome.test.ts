import { describe, expect, it } from "vitest";

import { CARD_SURFACE_BG_CLASS } from "@/lib/layout/card-surface";
import { chipButtonClassName } from "@/lib/layout/chip-chrome";

describe("chip foundation", () => {
  it("uses card surface background for active chips on canvas", () => {
    expect(chipButtonClassName("canvas", true)).toContain(CARD_SURFACE_BG_CLASS);
  });

  it("uses screen background for active chips inside cards", () => {
    expect(chipButtonClassName("card", true)).toContain("bg-background");
  });
});
