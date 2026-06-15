"use client";

import { useEffect, useState } from "react";

/** Keyboard overlap inside a fixed bottom sheet (workspace, search, field editor). */
export function useVisualViewportKeyboardInset(active: boolean) {
  const [insetPx, setInsetPx] = useState(0);

  useEffect(() => {
    if (!active) return;

    function measure() {
      const viewport = window.visualViewport;
      if (!viewport) {
        setInsetPx(0);
        return;
      }

      const overlap = Math.max(
        0,
        window.innerHeight - viewport.height - viewport.offsetTop,
      );
      setInsetPx(overlap);
    }

    measure();
    window.visualViewport?.addEventListener("resize", measure);
    window.visualViewport?.addEventListener("scroll", measure);

    return () => {
      window.visualViewport?.removeEventListener("resize", measure);
      window.visualViewport?.removeEventListener("scroll", measure);
    };
  }, [active]);

  return active ? insetPx : 0;
}
