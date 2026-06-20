/** Tracks institution brand assets loaded this session for instant re-display. */

const loadedBrandAssetPaths = new Set<string>();
const listeners = new Set<() => void>();

/** Stable snapshot for useSyncExternalStore — must keep referential equality until the set changes. */
let loadedBrandAssetPathsSnapshot: readonly string[] = [];

function refreshSnapshot() {
  loadedBrandAssetPathsSnapshot = Array.from(loadedBrandAssetPaths);
}

export function isBrandAssetLoaded(assetPath: string): boolean {
  return loadedBrandAssetPaths.has(assetPath);
}

export function markBrandAssetLoaded(assetPath: string) {
  if (loadedBrandAssetPaths.has(assetPath)) return;
  loadedBrandAssetPaths.add(assetPath);
  refreshSnapshot();
  listeners.forEach((listener) => listener());
}

const preloadingBrandAssetPaths = new Set<string>();

/** Warm the browser image cache for paths not yet loaded this session. */
export function preloadBrandAsset(assetPath: string) {
  if (
    typeof window === "undefined" ||
    loadedBrandAssetPaths.has(assetPath) ||
    preloadingBrandAssetPaths.has(assetPath)
  ) {
    return;
  }

  preloadingBrandAssetPaths.add(assetPath);
  const img = new Image();
  img.onload = () => {
    preloadingBrandAssetPaths.delete(assetPath);
    markBrandAssetLoaded(assetPath);
  };
  img.onerror = () => {
    preloadingBrandAssetPaths.delete(assetPath);
  };
  img.src = assetPath;
}

export function preloadBrandAssets(assetPaths: readonly string[]) {
  for (const assetPath of assetPaths) {
    preloadBrandAsset(assetPath);
  }
}

export function getLoadedBrandAssetPaths(): readonly string[] {
  return loadedBrandAssetPathsSnapshot;
}

export function subscribeLoadedBrandAssetPaths(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
