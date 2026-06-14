"use client";

import { type RefObject, useEffect } from "react";

import {
  applyKeyboardScrollInset,
  clearKeyboardScrollInset,
  scrollInputIntoContainer,
} from "@/lib/scroll/scroll-input-into-view";

function isFocusableInput(element: HTMLElement): boolean {
  if (element.isContentEditable) return true;
  const tag = element.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
}

function isInputInContainer(
  container: HTMLElement,
  element: Element | null,
): element is HTMLElement {
  return (
    element instanceof HTMLElement &&
    isFocusableInput(element) &&
    container.contains(element)
  );
}

/**
 * Focus-scoped keyboard scroll support.
 *
 * Lifecycle (keyboardInset forms only):
 *   focusin  → attach visualViewport.resize (once) → adjust padding + scroll
 *   focusout → defer check → if no input focused: detach listener, clear padding
 *   unmount  → full teardown
 *
 * No global viewport listeners. No listener survives blur.
 */
export function useFocusScrollIntoView(
  containerRef: RefObject<HTMLElement | null>,
  enabled = true,
  keyboardInset = false,
) {
  useEffect(() => {
    if (!enabled) return;

    const container = containerRef.current;
    if (!container) return;

    let focusedTarget: HTMLElement | null = null;
    let adjustRaf = 0;
    let followUpTimer: number | null = null;
    let focusOutRaf = 0;
    let viewportCoalesceRaf = 0;
    let viewportListenerAttached = false;

    function onViewportResize() {
      if (!focusedTarget) return;
      if (viewportCoalesceRaf) return;
      viewportCoalesceRaf = requestAnimationFrame(() => {
        viewportCoalesceRaf = 0;
        if (!focusedTarget) return;
        adjustForTarget(focusedTarget);
      });
    }

    function attachViewportListener() {
      if (!keyboardInset || viewportListenerAttached || !window.visualViewport) return;
      window.visualViewport.addEventListener("resize", onViewportResize);
      viewportListenerAttached = true;
    }

    function detachViewportListener() {
      if (!viewportListenerAttached || !window.visualViewport) return;
      window.visualViewport.removeEventListener("resize", onViewportResize);
      viewportListenerAttached = false;
    }

    function cancelAdjustPending() {
      if (adjustRaf) {
        cancelAnimationFrame(adjustRaf);
        adjustRaf = 0;
      }
      if (followUpTimer !== null) {
        clearTimeout(followUpTimer);
        followUpTimer = null;
      }
    }

    function cancelFocusOutCheck() {
      if (focusOutRaf) {
        cancelAnimationFrame(focusOutRaf);
        focusOutRaf = 0;
      }
    }

    function adjustForTarget(target: HTMLElement) {
      const scrollContainer = containerRef.current;
      if (!scrollContainer?.contains(target)) return;

      if (keyboardInset) {
        applyKeyboardScrollInset(scrollContainer);
      }
      scrollInputIntoContainer(scrollContainer, target);
    }

    function scheduleAdjust(target: HTMLElement) {
      cancelAdjustPending();
      cancelFocusOutCheck();
      focusedTarget = target;
      attachViewportListener();

      adjustRaf = requestAnimationFrame(() => {
        adjustRaf = 0;
        adjustForTarget(target);
        followUpTimer = window.setTimeout(() => {
          followUpTimer = null;
          if (focusedTarget === target) {
            adjustForTarget(target);
          }
        }, 120);
      });
    }

    function teardownFocusSession() {
      focusedTarget = null;
      cancelAdjustPending();
      cancelFocusOutCheck();
      if (viewportCoalesceRaf) {
        cancelAnimationFrame(viewportCoalesceRaf);
        viewportCoalesceRaf = 0;
      }
      detachViewportListener();

      const scrollContainer = containerRef.current;
      if (scrollContainer && keyboardInset) {
        clearKeyboardScrollInset(scrollContainer);
      }
    }

    function handleFocusIn(event: FocusEvent) {
      const target = event.target;
      const scrollContainer = containerRef.current;
      if (!(target instanceof HTMLElement) || !isFocusableInput(target)) return;
      if (!scrollContainer) return;

      scheduleAdjust(target);
    }

    function handleFocusOut(event: FocusEvent) {
      const target = event.target;
      if (!(target instanceof HTMLElement) || !isFocusableInput(target)) return;

      cancelAdjustPending();
      cancelFocusOutCheck();

      focusOutRaf = requestAnimationFrame(() => {
        focusOutRaf = 0;
        const scrollContainer = containerRef.current;
        if (!scrollContainer) return;

        if (isInputInContainer(scrollContainer, document.activeElement)) {
          scheduleAdjust(document.activeElement);
          return;
        }

        teardownFocusSession();
      });
    }

    container.addEventListener("focusin", handleFocusIn);
    container.addEventListener("focusout", handleFocusOut);

    return () => {
      teardownFocusSession();
      container.removeEventListener("focusin", handleFocusIn);
      container.removeEventListener("focusout", handleFocusOut);
    };
  }, [containerRef, enabled, keyboardInset]);
}
