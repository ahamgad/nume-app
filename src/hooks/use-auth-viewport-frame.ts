"use client";

import { useSyncExternalStore } from "react";

export interface AuthViewportFrame {
  height: number;
  offsetTop: number;
}

const SERVER_SNAPSHOT: AuthViewportFrame = { height: 0, offsetTop: 0 };

/** Stable client snapshot — referential equality is required by useSyncExternalStore. */
let clientSnapshot: AuthViewportFrame = SERVER_SNAPSHOT;
let keyboardVisibleSnapshot = false;

function getKeyboardVisible(next: AuthViewportFrame): boolean {
  // iOS Safari / Android Chrome: keyboard presence manifests as visual viewport overlap.
  // overlap = layout viewport height - visual viewport height - visual viewport offset.
  const overlap = Math.max(
    0,
    window.innerHeight - next.height - next.offsetTop,
  );
  return overlap > 0;
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

function syncClientSnapshot(): boolean {
  const next = readAuthViewportFrame();
  const nextKeyboardVisible =
    typeof window === "undefined" ? false : getKeyboardVisible(next);

  // Freeze the frame while the keyboard is already visible to avoid mirroring
  // transient visualViewport offsetTop adjustments during focus switches.
  if (keyboardVisibleSnapshot && nextKeyboardVisible) {
    return false;
  }

  const didKeyboardVisibilityChange =
    keyboardVisibleSnapshot !== nextKeyboardVisible;

  // Only update the snapshot when:
  // - keyboard opens/closes (smooth transition), OR
  // - keyboard is hidden and the viewport frame actually changes.
  if (
    !didKeyboardVisibilityChange &&
    clientSnapshot.height === next.height &&
    clientSnapshot.offsetTop === next.offsetTop
  ) {
    return false;
  }

  keyboardVisibleSnapshot = nextKeyboardVisible;
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
  window.addEventListener("scroll", lockDocumentScroll, { passive: true });

  return () => {
    viewport?.removeEventListener("resize", onViewportChange);
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
