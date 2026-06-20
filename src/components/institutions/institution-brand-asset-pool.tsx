"use client";

import { useSyncExternalStore } from "react";

import {
  getLoadedBrandAssetPaths,
  subscribeLoadedBrandAssetPaths,
} from "@/lib/institutions/brand-asset-cache";

/**
 * Keeps decoded institution logos mounted off-screen so tab switches and
 * stack navigation never trigger visible reload flashes.
 */
export function InstitutionBrandAssetPool() {
  const loadedPaths = useSyncExternalStore(
    subscribeLoadedBrandAssetPaths,
    getLoadedBrandAssetPaths,
    getLoadedBrandAssetPaths,
  );

  if (loadedPaths.length === 0) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed -left-[9999px] top-0 size-px overflow-hidden opacity-0"
    >
      {loadedPaths.map((assetPath) => (
        // eslint-disable-next-line @next/next/no-img-element -- persistent decode cache
        <img key={assetPath} src={assetPath} alt="" width={40} height={40} />
      ))}
    </div>
  );
}
