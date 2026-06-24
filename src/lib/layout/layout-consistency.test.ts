import { describe, expect, it } from "vitest";

import {
  getScreenBodyScrollPadding,
  STACK_SCREEN_BOTTOM_PADDING,
  SYSTEM_MESSAGE_GAP_PX,
  SYSTEM_MESSAGE_HORIZONTAL_INSET_PX,
  SYSTEM_MESSAGE_INSET_X_CLASS,
  SYSTEM_MESSAGE_TOP_OFFSET,
  TAB_BAR_SCROLL_PADDING,
} from "@/lib/layout/screen-spacing";
import { isTabBarVisible } from "@/lib/layout/tab-bar-visibility";
import { supportsQuickBalanceEdit } from "@/lib/finance/account-form";

describe("tab bar visibility", () => {
  it("shows on tab roots and hides on stack routes", () => {
    expect(isTabBarVisible("/accounts")).toBe(true);
    expect(isTabBarVisible("/")).toBe(true);
    expect(isTabBarVisible("/accounts/abc")).toBe(false);
    expect(isTabBarVisible("/accounts/abc/records/new")).toBe(false);
  });
});

describe("screen body scroll padding", () => {
  it("reserves tab bar height on tab-root screens", () => {
    expect(
      getScreenBodyScrollPadding({
        tabBarVisible: true,
        withStickyFooter: false,
      }),
    ).toBe(TAB_BAR_SCROLL_PADDING);
    expect(TAB_BAR_SCROLL_PADDING).toContain("3.5rem");
  });

  it("uses a single tab-bar-height inset on stack screens", () => {
    expect(
      getScreenBodyScrollPadding({
        tabBarVisible: false,
        withStickyFooter: false,
      }),
    ).toBe(STACK_SCREEN_BOTTOM_PADDING);
    expect(STACK_SCREEN_BOTTOM_PADDING).toContain("3.5rem");
  });
});

describe("system message spacing", () => {
  it("positions surfaces 4px below the fixed header", () => {
    expect(SYSTEM_MESSAGE_GAP_PX).toBe("4px");
    expect(SYSTEM_MESSAGE_TOP_OFFSET).toBe(
      "calc(calc(3.5rem + env(safe-area-inset-top)) + 4px)",
    );
  });

  it("insets edge-to-edge system messages 4px from each screen edge", () => {
    expect(SYSTEM_MESSAGE_HORIZONTAL_INSET_PX).toBe("4px");
    expect(SYSTEM_MESSAGE_INSET_X_CLASS).toBe("inset-x-1");
  });
});

describe("supportsQuickBalanceEdit", () => {
  it("includes savings accounts", () => {
    expect(supportsQuickBalanceEdit("savings_account")).toBe(true);
    expect(supportsQuickBalanceEdit("current_account")).toBe(true);
    expect(supportsQuickBalanceEdit("certificate")).toBe(false);
  });
});
