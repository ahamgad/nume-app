"use client";

import { useEffect, useState } from "react";

/**
 * Tracks on-screen keyboard overlap using the Visual Viewport API.
 * Returns pixels to lift fixed bottom UI so content stays above the keyboard.
 */
export function useVisualViewportInset(enabled = true): number {
  const [inset, setInset] = useState(0);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    const viewport = window.visualViewport;
    if (!viewport) return;

    function update() {
      const vv = window.visualViewport;
      if (!vv) {
        setInset(0);
        return;
      }
      const overlap = window.innerHeight - vv.height - vv.offsetTop;
      setInset(Math.max(0, Math.round(overlap)));
    }

    update();
    viewport.addEventListener("resize", update);
    viewport.addEventListener("scroll", update);
    window.addEventListener("orientationchange", update);

    return () => {
      viewport.removeEventListener("resize", update);
      viewport.removeEventListener("scroll", update);
      window.removeEventListener("orientationchange", update);
    };
  }, [enabled]);

  return inset;
}
