"use client";

import { useSyncExternalStore } from "react";

export interface AuthViewportFrame {
  height: number;
  offsetTop: number;
}

const SERVER_SNAPSHOT: AuthViewportFrame = { height: 0, offsetTop: 0 };

/** Stable client snapshot — referential equality is required by useSyncExternalStore. */
let clientSnapshot: AuthViewportFrame = SERVER_SNAPSHOT;

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

function syncClientSnapshot(): boolean {
  const next = readAuthViewportFrame();
  if (
    clientSnapshot.height === next.height &&
    clientSnapshot.offsetTop === next.offsetTop
  ) {
    return false;
  }

  clientSnapshot = next;
  return true;
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

function getSnapshot(): AuthViewportFrame {
  syncClientSnapshot();
  return clientSnapshot;
}

function getServerSnapshot(): AuthViewportFrame {
  return SERVER_SNAPSHOT;
}

function subscribe(onStoreChange: () => void) {
  function onViewportChange() {
    lockDocumentScroll();
    if (syncClientSnapshot()) {
      onStoreChange();
    }
  }

  syncClientSnapshot();
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

/**
 * Tracks the visual viewport for auth screens and prevents document scroll
 * while the keyboard is presenting so the card moves once, not per field.
 */
export function useAuthViewportFrame() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
