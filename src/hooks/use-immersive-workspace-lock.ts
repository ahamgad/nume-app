"use client";

import { useEffect } from "react";

/**
 * Locks document scroll while an immersive workspace (Field Editor) is open.
 * Stronger than modal layer alone — prevents page rubber-banding behind the sheet.
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
