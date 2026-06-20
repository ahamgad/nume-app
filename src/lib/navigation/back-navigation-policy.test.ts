import { describe, expect, it } from "vitest";

import {
  isSwipeBackExemptPath,
  shouldBlockNavigationEdgeSwipe,
  shouldRestoreTabRootAfterPopState,
} from "@/lib/navigation/back-navigation-policy";

describe("shouldRestoreTabRootAfterPopState", () => {
  it("restores when swipe would move between tab roots", () => {
    expect(shouldRestoreTabRootAfterPopState("/accounts", "/planning")).toBe(
      true,
    );
    expect(shouldRestoreTabRootAfterPopState("/accounts", "/")).toBe(true);
  });

  it("does not restore when staying on the same tab root", () => {
    expect(shouldRestoreTabRootAfterPopState("/accounts", "/accounts")).toBe(
      false,
    );
  });

  it("does not restore when leaving a stack screen", () => {
    expect(
      shouldRestoreTabRootAfterPopState("/accounts/abc", "/accounts"),
    ).toBe(false);
  });

  it("does not restore when leaving a tab root for auth routes", () => {
    expect(shouldRestoreTabRootAfterPopState("/accounts", "/login")).toBe(
      false,
    );
  });
});

describe("shouldBlockNavigationEdgeSwipe", () => {
  it("blocks on tab roots and dirty screens", () => {
    expect(shouldBlockNavigationEdgeSwipe("/accounts", false)).toBe(true);
    expect(shouldBlockNavigationEdgeSwipe("/accounts/abc/edit", true)).toBe(
      true,
    );
  });

  it("allows clean stack screens", () => {
    expect(shouldBlockNavigationEdgeSwipe("/accounts/abc", false)).toBe(false);
    expect(shouldBlockNavigationEdgeSwipe("/accounts/abc/edit", false)).toBe(
      false,
    );
  });

  it("keeps native swipe on theme selection even when dirty", () => {
    expect(isSwipeBackExemptPath("/more/appearance")).toBe(true);
    expect(shouldBlockNavigationEdgeSwipe("/more/appearance", true)).toBe(
      false,
    );
  });
});
