"use client";

import { useSyncExternalStore } from "react";

export interface AuthViewportFrame {
  height: number;
  offsetTop: number;
}

function readAuthViewportFrame(): AuthViewportFrame {
  const viewport = window.visualViewport;
  if (!viewport) {
    return { height: window.innerHeight, offsetTop: 0 };
  }

  return {
    height: viewport.height,
    offsetTop: viewport.offsetTop,
  };
}

function lockDocumentScroll() {
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

function subscribe(onStoreChange: () => void) {
  function onViewportChange() {
    lockDocumentScroll();
    onStoreChange();
  }

  lockDocumentScroll();

  const viewport = window.visualViewport;
  viewport?.addEventListener("resize", onViewportChange);
  viewport?.addEventListener("scroll", onViewportChange);
  window.addEventListener("scroll", lockDocumentScroll, { passive: true });

  return () => {
    viewport?.removeEventListener("resize", onViewportChange);
    viewport?.removeEventListener("scroll", onViewportChange);
    window.removeEventListener("scroll", lockDocumentScroll);
  };
}

function getSnapshot(): AuthViewportFrame {
  return readAuthViewportFrame();
}

function getServerSnapshot(): AuthViewportFrame {
  return { height: 0, offsetTop: 0 };
}

/**
 * Tracks the visual viewport for auth screens and prevents document scroll
 * while the keyboard is presenting so the card moves once, not per field.
 */
export function useAuthViewportFrame() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
