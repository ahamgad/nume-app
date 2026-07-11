import { describe, expect, it } from "vitest";

import {
  IS_SWIPE_BACK_ENABLED,
  isSwipeBackDisabledStackPath,
  shouldBlockNavigationEdgeSwipe,
  shouldRestoreTabRootAfterPopState,
  shouldSyncRouterAfterCleanPopState,
} from "@/lib/navigation/back-navigation-policy";

describe("shouldRestoreTabRootAfterPopState", () => {
  it("restores when swipe would move between tab roots", () => {
    expect(shouldRestoreTabRootAfterPopState("/accounts", "/planning")).toBe(
      true,
    );
    expect(shouldRestoreTabRootAfterPopState("/accounts", "/dashboard")).toBe(
      true,
    );
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
    expect(shouldRestoreTabRootAfterPopState("/accounts", "/continue")).toBe(
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

  it("blocks clean stack screens when swipe is disabled", () => {
    expect(IS_SWIPE_BACK_ENABLED).toBe(false);
    expect(shouldBlockNavigationEdgeSwipe("/accounts/abc", false)).toBe(true);
    expect(shouldBlockNavigationEdgeSwipe("/accounts/abc/edit", false)).toBe(
      true,
    );
  });

  it("blocks swipe on appearance even when not dirty", () => {
    expect(isSwipeBackDisabledStackPath("/more/appearance")).toBe(true);
    expect(shouldBlockNavigationEdgeSwipe("/more/appearance", false)).toBe(
      true,
    );
    expect(shouldBlockNavigationEdgeSwipe("/more/appearance", true)).toBe(true);
  });
});

describe("shouldSyncRouterAfterCleanPopState", () => {
  it("resyncs when native back leaves a stack screen", () => {
    expect(
      shouldSyncRouterAfterCleanPopState(
        "/accounts/new/savings_account",
        "/accounts",
      ),
    ).toBe(true);
    expect(
      shouldSyncRouterAfterCleanPopState(
        "/accounts/abc/edit",
        "/accounts/abc",
      ),
    ).toBe(true);
  });

  it("does not resync when React already matches the destination", () => {
    expect(
      shouldSyncRouterAfterCleanPopState("/accounts", "/accounts"),
    ).toBe(false);
  });

  it("does not resync for tab-root cross-tab gestures", () => {
    expect(
      shouldSyncRouterAfterCleanPopState("/accounts", "/planning"),
    ).toBe(false);
  });
});
