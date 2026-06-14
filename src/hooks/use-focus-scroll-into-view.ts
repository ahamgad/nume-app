"use client";

import { type RefObject, useEffect } from "react";

const HEADER_CLEARANCE_PX = 64;

function isFocusableInput(element: HTMLElement): boolean {
  if (element.isContentEditable) return true;
  const tag = element.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
}

function isInputVisible(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  const visibleBottom =
    (window.visualViewport?.height ?? window.innerHeight) - 16;
  return rect.top >= HEADER_CLEARANCE_PX && rect.bottom <= visibleBottom;
}

/**
 * Trust native keyboard handling. On focus, scroll into view once if needed.
 * No spacers, scroll lock, viewport resize, or continuous recalculation.
 */
export function useFocusScrollIntoView(
  containerRef: RefObject<HTMLElement | null>,
  enabled = true,
) {
  useEffect(() => {
    if (!enabled) return;

    const container = containerRef.current;
    if (!container) return;

    function handleFocusIn(event: FocusEvent) {
      const target = event.target;
      if (!(target instanceof HTMLElement) || !isFocusableInput(target)) return;

      requestAnimationFrame(() => {
        if (isInputVisible(target)) return;
        target.scrollIntoView({ block: "center", behavior: "smooth" });
      });
    }

    container.addEventListener("focusin", handleFocusIn);
    return () => container.removeEventListener("focusin", handleFocusIn);
  }, [containerRef, enabled]);
}
