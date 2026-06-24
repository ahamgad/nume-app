import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  BOTTOM_SHEET_BOTTOM_RADIUS_CLASS,
  BOTTOM_SHEET_HEADER_BAR_CLASS,
  BOTTOM_SHEET_HEADER_BAR_HEIGHT_CLASS,
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
    expect(BOTTOM_SHEET_BOTTOM_RADIUS_CLASS).toBe("rounded-b-[36px]");
  });

  it("uses separate vertical sizing from page headers", () => {
    expect(BOTTOM_SHEET_HEADER_BAR_HEIGHT_CLASS).toBe("4.75rem");
    expect(SCREEN_HEADER_BAR_HEIGHT_CLASS).toBe("3.5rem");
    expect(BOTTOM_SHEET_HEADER_BAR_CLASS).toContain("py-4");
    expect(SCREEN_HEADER_BAR_CLASS).toContain("h-14");
    expect(SCREEN_HEADER_BAR_CLASS).not.toContain("py-4");
  });

  it("aligns headerless sheet top padding with the sheet header bar", () => {
    expect(BOTTOM_SHEET_HEADERLESS_TOP_PADDING_CLASS).toBe("pt-[4.75rem]");
  });

  it("centralizes header title line-height in the shared token", () => {
    expect(SCREEN_HEADER_TITLE_CLASS).toContain("leading-tight");
    expect(SCREEN_HEADER_TITLE_CLASS).toContain("text-base");
  });

  it("composes header bars from the same horizontal padding and gap tokens", () => {
    expect(SCREEN_HEADER_BAR_CLASS).toContain(SCREEN_HEADER_HORIZONTAL_PADDING_CLASS);
    expect(SCREEN_HEADER_BAR_CLASS).toContain(SCREEN_HEADER_ITEM_GAP_CLASS);
    expect(BOTTOM_SHEET_HEADER_BAR_CLASS).toContain(SCREEN_HEADER_HORIZONTAL_PADDING_CLASS);
    expect(BOTTOM_SHEET_HEADER_BAR_CLASS).toContain(SCREEN_HEADER_ITEM_GAP_CLASS);
  });

  it("shares trailing slot and text action tokens with page headers", () => {
    expect(SCREEN_HEADER_TRAILING_SLOT_CLASS).toContain("shrink-0");
    expect(SCREEN_HEADER_TRAILING_SLOT_CLASS).toContain("justify-end");
    expect(SCREEN_HEADER_TEXT_ACTION_CLASS).toContain("h-11");
  });

  it("propagates canvas surface context through shared bottom sheet panel and header", () => {
    const chrome = fs.readFileSync(
      path.join(process.cwd(), "src/components/ui/bottom-sheet-chrome.tsx"),
      "utf8",
    );

    expect(chrome).toContain("export function BottomSheetPanel");
    expect(chrome).toContain('SurfaceStateProvider value="canvas"');
    expect(chrome).toContain("export function BottomSheetHeader");

    for (const sheet of [
      "picker-bottom-sheet.tsx",
      "immersive-bottom-sheet.tsx",
      "confirmation-bottom-sheet.tsx",
    ]) {
      const source = fs.readFileSync(
        path.join(process.cwd(), "src/components/ui", sheet),
        "utf8",
      );
      expect(source).toContain("BottomSheetPanel");
      expect(source).not.toContain("BOTTOM_SHEET_PANEL_CLASS");
    }
  });
});
