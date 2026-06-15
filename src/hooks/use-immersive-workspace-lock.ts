"use client";

import { useEffect } from "react";

/**
 * Locks document scroll while an immersive **workspace** sheet is open (Field Editor).
 * Do not use for search sheets — use `useSearchSheetLock` instead.
 */
export function useImmersiveWorkspaceLock(active: boolean) {
  useEffect(() => {
    if (!active) return;

    const html = document.documentElement;
    html.dataset.immersiveWorkspace = "true";

    return () => {
      delete html.dataset.immersiveWorkspace;
    };
  }, [active]);
}
