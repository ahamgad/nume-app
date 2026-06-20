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

export function getLoadedBrandAssetPaths(): readonly string[] {
  return loadedBrandAssetPathsSnapshot;
}

export function subscribeLoadedBrandAssetPaths(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
