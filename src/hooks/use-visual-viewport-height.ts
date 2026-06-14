"use client";

import { useEffect, useState } from "react";

/**
 * Binds the app shell to the visible viewport height so iOS keyboard
 * resize does not scroll the document (and fixed headers stay put).
 */
export function useVisualViewportHeight(enabled = true): number | null {
  const [height, setHeight] = useState<number | null>(null);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    const viewport = window.visualViewport;

    function update() {
      const vv = window.visualViewport;
      setHeight(vv?.height ?? window.innerHeight);
    }

    update();
    viewport?.addEventListener("resize", update);
    viewport?.addEventListener("scroll", update);
    window.addEventListener("orientationchange", update);

    return () => {
      viewport?.removeEventListener("resize", update);
      viewport?.removeEventListener("scroll", update);
      window.removeEventListener("orientationchange", update);
    };
  }, [enabled]);

  return height;
}
