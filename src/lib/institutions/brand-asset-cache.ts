/** Tracks institution brand assets loaded this session for instant re-display. */

const loadedBrandAssetPaths = new Set<string>();
const listeners = new Set<() => void>();

export function isBrandAssetLoaded(assetPath: string): boolean {
  return loadedBrandAssetPaths.has(assetPath);
}

export function markBrandAssetLoaded(assetPath: string) {
  if (loadedBrandAssetPaths.has(assetPath)) return;
  loadedBrandAssetPaths.add(assetPath);
  listeners.forEach((listener) => listener());
}

export function getLoadedBrandAssetPaths(): readonly string[] {
  return Array.from(loadedBrandAssetPaths);
}

export function subscribeLoadedBrandAssetPaths(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
