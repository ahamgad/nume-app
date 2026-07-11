"use client";

import { type RefObject, useEffect, useState } from "react";

import { isKeyboardPresent } from "@/lib/scroll/scroll-input-into-view";

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

/** Targets that must remain tappable while the keyboard lock is active. */
function isAuthInteractiveTouchTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  return Boolean(
    target.closest(
      "input, textarea, button, a, [role='button'], [role='link']",
    ),
  );
}

function preventTouchPan(event: TouchEvent) {
  if (isAuthInteractiveTouchTarget(event.target)) return;
  event.preventDefault();
}

/**
 * Auth-only viewport protection while the software keyboard is visible.
 * Guards attach to the auth surface element only and detach on keyboard close.
 */
export function useAuthViewportLock(
  surfaceRef: RefObject<HTMLElement | null>,
  enabled = true,
) {
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    function syncKeyboard() {
      setKeyboardVisible(isKeyboardPresent());
    }

    syncKeyboard();
    window.visualViewport?.addEventListener("resize", syncKeyboard);
    window.visualViewport?.addEventListener("scroll", syncKeyboard);

    return () => {
      window.visualViewport?.removeEventListener("resize", syncKeyboard);
      window.visualViewport?.removeEventListener("scroll", syncKeyboard);
    };
  }, [enabled]);

  useEffect(() => {
    if (!enabled || !keyboardVisible) return;

    const surface = surfaceRef.current;
    if (!surface) return;

    function preventViewportPan() {
      resetDocumentScroll();
    }

    preventViewportPan();
    window.visualViewport?.addEventListener("resize", preventViewportPan);
    window.visualViewport?.addEventListener("scroll", preventViewportPan);
    window.addEventListener("scroll", preventViewportPan, { passive: true });
    surface.addEventListener("touchstart", preventTouchPan, {
      capture: true,
      passive: false,
    });
    surface.addEventListener("touchmove", preventTouchPan, {
      capture: true,
      passive: false,
    });

    return () => {
      window.visualViewport?.removeEventListener("resize", preventViewportPan);
      window.visualViewport?.removeEventListener("scroll", preventViewportPan);
      window.removeEventListener("scroll", preventViewportPan);
      surface.removeEventListener("touchstart", preventTouchPan, true);
      surface.removeEventListener("touchmove", preventTouchPan, true);
    };
  }, [enabled, keyboardVisible, surfaceRef]);

  return { keyboardVisible };
}

/** Applied to the auth surface only while the keyboard is visible. */
export const AUTH_KEYBOARD_SURFACE_CLASS =
  "min-h-dvh touch-none [&_a]:touch-manipulation [&_button]:touch-manipulation [&_input]:touch-manipulation [&_textarea]:touch-manipulation";
