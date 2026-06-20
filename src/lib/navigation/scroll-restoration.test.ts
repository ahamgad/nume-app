import { describe, expect, it } from "vitest";

import {
  buildScrollRestorationKey,
  clearScrollPosition,
  getScrollPosition,
  setScrollPosition,
} from "@/lib/navigation/scroll-restoration";

describe("scroll restoration", () => {
  it("builds keys from pathname and search", () => {
    expect(buildScrollRestorationKey("/accounts")).toBe("/accounts");
    expect(buildScrollRestorationKey("/accounts", "?filter=archived")).toBe(
      "/accounts?filter=archived",
    );
  });

  it("stores and retrieves scroll positions", () => {
    clearScrollPosition("/accounts");
    expect(getScrollPosition("/accounts")).toBeUndefined();

    setScrollPosition("/accounts", 1800);
    expect(getScrollPosition("/accounts")).toBe(1800);
  });

  it("clears zero scroll positions", () => {
    setScrollPosition("/planning", 400);
    setScrollPosition("/planning", 0);
    expect(getScrollPosition("/planning")).toBeUndefined();
  });
});
