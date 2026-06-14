"use client";

import { type RefObject, useEffect } from "react";

import {
  isInputVisibleInContainer,
  scrollInputIntoContainer,
} from "@/lib/scroll/scroll-input-into-view";

function isFocusableInput(element: HTMLElement): boolean {
  if (element.isContentEditable) return true;
  const tag = element.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
}

/**
 * Trust native keyboard handling. On focus, scroll within ScreenBody once if needed.
 * Never uses scrollIntoView — avoids document/window scroll bleed.
 */
export function useFocusScrollIntoView(
  containerRef: RefObject<HTMLElement | null>,
  enabled = true,
) {
  useEffect(() => {
    if (!enabled) return;

    const container = containerRef.current;
    if (!container) return;

    let frameId = 0;
    let followUpTimer: number | null = null;

    function clearPending() {
      if (frameId) {
        cancelAnimationFrame(frameId);
        frameId = 0;
      }
      if (followUpTimer !== null) {
        clearTimeout(followUpTimer);
        followUpTimer = null;
      }
    }

    function handleFocusIn(event: FocusEvent) {
      const target = event.target;
      const scrollContainer = containerRef.current;
      if (!(target instanceof HTMLElement) || !isFocusableInput(target)) return;
      if (!scrollContainer) return;

      clearPending();

      const adjust = () => {
        if (!scrollContainer.contains(target)) return;
        scrollInputIntoContainer(scrollContainer, target);
      };

      frameId = requestAnimationFrame(() => {
        frameId = 0;
        if (isInputVisibleInContainer(scrollContainer, target)) return;
        adjust();
        followUpTimer = window.setTimeout(() => {
          followUpTimer = null;
          adjust();
        }, 120);
      });
    }

    function handleFocusOut(event: FocusEvent) {
      const target = event.target;
      if (!(target instanceof HTMLElement) || !isFocusableInput(target)) return;
      clearPending();
    }

    container.addEventListener("focusin", handleFocusIn);
    container.addEventListener("focusout", handleFocusOut);

    return () => {
      clearPending();
      container.removeEventListener("focusin", handleFocusIn);
      container.removeEventListener("focusout", handleFocusOut);
    };
  }, [containerRef, enabled]);
}
