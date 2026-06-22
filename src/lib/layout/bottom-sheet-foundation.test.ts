import { describe, expect, it } from "vitest";

import {
  BOTTOM_SHEET_HEADERLESS_TOP_PADDING_CLASS,
  BOTTOM_SHEET_TOP_RADIUS_CLASS,
  BOTTOM_SHEET_TOP_RADIUS_PX,
} from "@/lib/layout/bottom-sheet";
import {
  SCREEN_HEADER_BAR_CLASS,
  SCREEN_HEADER_BAR_HEIGHT_CLASS,
  SCREEN_HEADER_HORIZONTAL_PADDING_CLASS,
  SCREEN_HEADER_ITEM_GAP_CLASS,
  SCREEN_HEADER_TEXT_ACTION_CLASS,
  SCREEN_HEADER_TITLE_CLASS,
  SCREEN_HEADER_TRAILING_SLOT_CLASS,
} from "@/lib/layout/screen-spacing";

describe("bottom sheet foundation", () => {
  it("uses a unified 36px top corner radius on all panels", () => {
    expect(BOTTOM_SHEET_TOP_RADIUS_PX).toBe(36);
    expect(BOTTOM_SHEET_TOP_RADIUS_CLASS).toBe("rounded-t-[36px]");
  });

  it("aligns headerless sheet top padding with the header content zone", () => {
    expect(BOTTOM_SHEET_HEADERLESS_TOP_PADDING_CLASS).toBe("pt-[calc(4.75rem+1px)]");
    expect(SCREEN_HEADER_BAR_HEIGHT_CLASS).toBe("4.75rem");
    expect(SCREEN_HEADER_BAR_CLASS).toContain("py-4");
  });

  it("centralizes header title line-height in the shared token", () => {
    expect(SCREEN_HEADER_TITLE_CLASS).toContain("leading-tight");
    expect(SCREEN_HEADER_TITLE_CLASS).toContain("text-base");
  });

  it("composes the header bar from the same horizontal padding and gap tokens", () => {
    expect(SCREEN_HEADER_BAR_CLASS).toContain(SCREEN_HEADER_HORIZONTAL_PADDING_CLASS);
    expect(SCREEN_HEADER_BAR_CLASS).toContain(SCREEN_HEADER_ITEM_GAP_CLASS);
  });

  it("shares trailing slot and text action tokens with page headers", () => {
    expect(SCREEN_HEADER_TRAILING_SLOT_CLASS).toContain("shrink-0");
    expect(SCREEN_HEADER_TRAILING_SLOT_CLASS).toContain("justify-end");
    expect(SCREEN_HEADER_TEXT_ACTION_CLASS).toContain("h-11");
  });
});
