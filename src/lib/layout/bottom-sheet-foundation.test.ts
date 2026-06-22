import { describe, expect, it } from "vitest";

import {
  BOTTOM_SHEET_HEADERLESS_TOP_PADDING_CLASS,
  BOTTOM_SHEET_TOP_RADIUS_CLASS,
  BOTTOM_SHEET_TOP_RADIUS_PX,
} from "@/lib/layout/bottom-sheet";
import { SCREEN_HEADER_BAR_CLASS, SCREEN_HEADER_BAR_HEIGHT_CLASS } from "@/lib/layout/screen-spacing";

describe("bottom sheet foundation", () => {
  it("uses a unified 36px top corner radius on all panels", () => {
    expect(BOTTOM_SHEET_TOP_RADIUS_PX).toBe(36);
    expect(BOTTOM_SHEET_TOP_RADIUS_CLASS).toBe("rounded-t-[36px]");
  });

  it("aligns headerless sheet top padding with the standard header bar height", () => {
    expect(BOTTOM_SHEET_HEADERLESS_TOP_PADDING_CLASS).toBe("pt-14");
    expect(SCREEN_HEADER_BAR_HEIGHT_CLASS).toBe("3.5rem");
    expect(SCREEN_HEADER_BAR_CLASS).toContain("h-14");
  });
});
