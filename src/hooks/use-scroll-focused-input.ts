"use client";

import { type RefObject, useEffect } from "react";

function isScrollTarget(element: HTMLElement): boolean {
  if (element.isContentEditable) return true;
  const tag = element.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
}

interface UseScrollFocusedInputOptions {
  enabled?: boolean;
  /** Space reserved below the focused field (sticky footer + safe area). */
  bottomReservePx: number;
  keyboardInset: number;
}

/**
 * Keeps focused inputs visible inside a scroll container while the keyboard is open.
 */
export function useScrollFocusedInput(
  containerRef: RefObject<HTMLElement | null>,
  {
    enabled = true,
    bottomReservePx,
    keyboardInset,
  }: UseScrollFocusedInputOptions,
) {
  useEffect(() => {
    if (!enabled) return;

    const container = containerRef.current;
    if (!container) return;

    function scrollTargetIntoView(target: HTMLElement) {
      const targetRect = target.getBoundingClientRect();
      const containerRect = container!.getBoundingClientRect();
      const visibleTop = containerRect.top + 8;
      const visibleBottom =
        (window.visualViewport?.height ?? window.innerHeight) -
        bottomReservePx -
        keyboardInset -
        8;

      if (targetRect.bottom > visibleBottom) {
        container!.scrollTop += targetRect.bottom - visibleBottom;
      } else if (targetRect.top < visibleTop) {
        container!.scrollTop -= visibleTop - targetRect.top;
      }
    }

    function handleFocusIn(event: FocusEvent) {
      const target = event.target;
      if (!(target instanceof HTMLElement) || !isScrollTarget(target)) return;

      requestAnimationFrame(() => {
        scrollTargetIntoView(target);
      });
    }

    container.addEventListener("focusin", handleFocusIn);
    return () => container.removeEventListener("focusin", handleFocusIn);
  }, [bottomReservePx, containerRef, enabled, keyboardInset]);
}
