import { describe, expect, it } from "vitest";

import { getScreenBodyScrollPadding, TAB_BAR_SCROLL_PADDING } from "@/lib/layout/screen-spacing";
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
  });

  it("uses the same inset on stack screens for consistent bottom breathing room", () => {
    expect(
      getScreenBodyScrollPadding({
        tabBarVisible: false,
        withStickyFooter: false,
      }),
    ).toBe(TAB_BAR_SCROLL_PADDING);
  });
});

describe("supportsQuickBalanceEdit", () => {
  it("includes savings accounts", () => {
    expect(supportsQuickBalanceEdit("savings_account")).toBe(true);
    expect(supportsQuickBalanceEdit("current_account")).toBe(true);
    expect(supportsQuickBalanceEdit("certificate")).toBe(false);
  });
});
