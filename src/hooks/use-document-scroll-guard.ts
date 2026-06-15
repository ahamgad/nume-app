"use client";

import { useEffect } from "react";

function documentScrollIsZero() {
  return (
    window.scrollY === 0 &&
    document.documentElement.scrollTop === 0 &&
    document.body.scrollTop === 0
  );
}

function resetDocumentScroll() {
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

/** Keeps window/document scroll at zero — ScreenBody is the sole scroll owner. */
export function useDocumentScrollGuard(enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    let rafId = 0;

    function enforceZeroScroll() {
      if (documentScrollIsZero()) return;

      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        if (documentScrollIsZero()) return;
        resetDocumentScroll();
      });
    }

    if (!documentScrollIsZero()) {
      resetDocumentScroll();
    }

    window.addEventListener("scroll", enforceZeroScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", enforceZeroScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [enabled]);
}
