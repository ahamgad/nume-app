import { describe, expect, it } from "vitest";

import {
  getScreenBodyScrollPadding,
  STACK_SCREEN_BOTTOM_PADDING,
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
  it("reserves double tab bar height on tab-root screens", () => {
    expect(
      getScreenBodyScrollPadding({
        tabBarVisible: true,
        withStickyFooter: false,
      }),
    ).toBe(TAB_BAR_SCROLL_PADDING);
    expect(TAB_BAR_SCROLL_PADDING).toContain("7rem");
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

describe("supportsQuickBalanceEdit", () => {
  it("includes savings accounts", () => {
    expect(supportsQuickBalanceEdit("savings_account")).toBe(true);
    expect(supportsQuickBalanceEdit("current_account")).toBe(true);
    expect(supportsQuickBalanceEdit("certificate")).toBe(false);
  });
});
