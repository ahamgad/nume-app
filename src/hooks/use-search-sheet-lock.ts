"use client";

import { useEffect } from "react";

/**
 * Locks the document while a Foundation search sheet is open.
 *
 * Search sheets are NOT workspace sheets — do not use `useImmersiveWorkspaceLock`.
 * This hook freezes the page and prevents visual-viewport panning on keyboard open.
 */
export function useSearchSheetLock(active: boolean) {
  useEffect(() => {
    if (!active) return;

    const html = document.documentElement;
    html.dataset.searchSheetOpen = "true";

    function preventViewportPan() {
      if (window.scrollY !== 0) {
        window.scrollTo(0, 0);
      }
      if (document.documentElement.scrollTop !== 0) {
        document.documentElement.scrollTop = 0;
      }
      if (document.body.scrollTop !== 0) {
        document.body.scrollTop = 0;
      }
    }

    preventViewportPan();
    window.visualViewport?.addEventListener("resize", preventViewportPan);
    window.visualViewport?.addEventListener("scroll", preventViewportPan);
    window.addEventListener("scroll", preventViewportPan, { passive: true });

    return () => {
      delete html.dataset.searchSheetOpen;
      window.visualViewport?.removeEventListener("resize", preventViewportPan);
      window.visualViewport?.removeEventListener("scroll", preventViewportPan);
      window.removeEventListener("scroll", preventViewportPan);
    };
  }, [active]);
}
