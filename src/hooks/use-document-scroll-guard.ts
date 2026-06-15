"use client";

import { useEffect } from "react";

import {
  captureLayoutSnapshot,
  diffLayoutSnapshots,
  LAYOUT_SHIFT_DIAGNOSTICS_ENABLED,
  logLayoutSnapshot,
} from "@/lib/layout/layout-shift-diagnostics";

function documentScrollIsZero() {
  return (
    window.scrollY === 0 &&
    document.documentElement.scrollTop === 0 &&
    document.body.scrollTop === 0
  );
}

function resetDocumentScroll() {
  const before = LAYOUT_SHIFT_DIAGNOSTICS_ENABLED
    ? captureLayoutSnapshot("before-focus")
    : null;

  if (window.scrollY !== 0) {
    window.scrollTo(0, 0);
  }
  if (document.documentElement.scrollTop !== 0) {
    document.documentElement.scrollTop = 0;
  }
  if (document.body.scrollTop !== 0) {
    document.body.scrollTop = 0;
  }

  if (before && LAYOUT_SHIFT_DIAGNOSTICS_ENABLED) {
    const after = captureLayoutSnapshot("document-scroll-guard-reset");
    logLayoutSnapshot(after);
    diffLayoutSnapshots(before, after);
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
