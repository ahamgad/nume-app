"use client";

import { useEffect, useState } from "react";

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

function isAuthFieldTouchTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  return Boolean(target.closest("input, textarea"));
}

/**
 * Auth-only viewport protection while the software keyboard is visible.
 * Attaches pan/scroll guards on keyboard open and removes them on close.
 */
export function useAuthViewportLock(enabled = true) {
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

    function preventViewportPan() {
      resetDocumentScroll();
    }

    function preventTouchMove(event: TouchEvent) {
      if (isAuthFieldTouchTarget(event.target)) return;
      event.preventDefault();
    }

    preventViewportPan();
    window.visualViewport?.addEventListener("resize", preventViewportPan);
    window.visualViewport?.addEventListener("scroll", preventViewportPan);
    window.addEventListener("scroll", preventViewportPan, { passive: true });
    document.addEventListener("touchmove", preventTouchMove, { passive: false });

    return () => {
      window.visualViewport?.removeEventListener("resize", preventViewportPan);
      window.visualViewport?.removeEventListener("scroll", preventViewportPan);
      window.removeEventListener("scroll", preventViewportPan);
      document.removeEventListener("touchmove", preventTouchMove);
    };
  }, [enabled, keyboardVisible]);
}
