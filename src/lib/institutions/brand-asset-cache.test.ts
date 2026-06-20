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
    const afterSnapshot = getLoadedBrandAssetPaths();
    expect(isBrandAssetLoaded(path)).toBe(true);
    expect(afterSnapshot).toContain(path);
    expect(notificationCount).toBe(1);

    markBrandAssetLoaded(path);
    expect(notificationCount).toBe(1);
    expect(getLoadedBrandAssetPaths()).toBe(afterSnapshot);

    unsubscribe();
  });

  it("keeps a stable snapshot reference until the cache changes", () => {
    const first = getLoadedBrandAssetPaths();
    const second = getLoadedBrandAssetPaths();
    expect(first).toBe(second);

    markBrandAssetLoaded("/institutions/stable-snapshot.png");
    const third = getLoadedBrandAssetPaths();
    expect(third).not.toBe(first);
    expect(getLoadedBrandAssetPaths()).toBe(third);
  });
});
