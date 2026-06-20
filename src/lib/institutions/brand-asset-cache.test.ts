import { describe, expect, it } from "vitest";

import {
  getLoadedBrandAssetPaths,
  isBrandAssetLoaded,
  markBrandAssetLoaded,
  subscribeLoadedBrandAssetPaths,
} from "@/lib/institutions/brand-asset-cache";

describe("brand asset cache", () => {
  it("tracks loaded paths and notifies subscribers", () => {
    const path = "/institutions/test-cache.png";
    let notificationCount = 0;

    const unsubscribe = subscribeLoadedBrandAssetPaths(() => {
      notificationCount += 1;
    });

    expect(isBrandAssetLoaded(path)).toBe(false);
    markBrandAssetLoaded(path);
    expect(isBrandAssetLoaded(path)).toBe(true);
    expect(getLoadedBrandAssetPaths()).toContain(path);
    expect(notificationCount).toBe(1);

    markBrandAssetLoaded(path);
    expect(notificationCount).toBe(1);

    unsubscribe();
  });
});
