import { describe, expect, it } from "vitest";

import {
  isTabRootPath,
  shouldBlockNavigationEdgeSwipe,
  TAB_ROOT_PATHS,
} from "@/lib/navigation/tab-roots";

describe("tab root navigation", () => {
  it("lists the five tab bar destinations", () => {
    expect(TAB_ROOT_PATHS).toEqual([
      "/",
      "/planning",
      "/accounts",
      "/goals",
      "/more",
    ]);
  });

  it("recognizes tab roots but not stack routes", () => {
    expect(isTabRootPath("/")).toBe(true);
    expect(isTabRootPath("/accounts")).toBe(true);
    expect(isTabRootPath("/accounts/abc")).toBe(false);
    expect(isTabRootPath("/more/language")).toBe(false);
  });

  it("blocks edge swipe only on tab roots", () => {
    expect(shouldBlockNavigationEdgeSwipe("/goals")).toBe(true);
    expect(shouldBlockNavigationEdgeSwipe("/accounts/abc/edit")).toBe(false);
  });
});
