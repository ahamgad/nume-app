"use client";

import { type RefObject, useEffect } from "react";

import {
  applyKeyboardScrollInset,
  clearKeyboardScrollInset,
  isInputFullyVisibleInContainer,
  isInputObscuredByKeyboard,
  isKeyboardPresent,
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
 * Isolation experiment: upper fields already fully visible in the scroll
 * container bypass the entire keyboard pipeline — no visualViewport listeners,
 * no rAF follow-ups, no inset, no scroll mutation.
 *
 * Lifecycle (when pipeline engages):
 *   focusin  → obscured check after keyboard presents → minimal scroll + inset
 *   focusout → defer check → teardown when no input focused
 *   unmount  → full teardown
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
    let pipelineBypassed = false;
    let adjustRaf = 0;
    let followUpTimer: number | null = null;
    let focusOutRaf = 0;
    let viewportCoalesceRaf = 0;
    let viewportListenerAttached = false;

    function onViewportResize() {
      if (!focusedTarget || pipelineBypassed) return;
      if (viewportCoalesceRaf) return;
      viewportCoalesceRaf = requestAnimationFrame(() => {
        viewportCoalesceRaf = 0;
        if (!focusedTarget || pipelineBypassed) return;
        adjustForTarget(focusedTarget);
      });
    }

    function attachViewportListener() {
      if (viewportListenerAttached || !window.visualViewport) return;
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

    function clearKeyboardPipelineState() {
      cancelAdjustPending();
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

    function adjustForTarget(target: HTMLElement) {
      const scrollContainer = containerRef.current;
      if (!scrollContainer?.contains(target)) return;

      if (!isKeyboardPresent()) return;

      if (!isInputObscuredByKeyboard(scrollContainer, target)) return;

      attachViewportListener();

      if (keyboardInset) {
        applyKeyboardScrollInset(scrollContainer);
      }

      scrollInputIntoContainer(scrollContainer, target);
    }

    function runFollowUpAdjust(target: HTMLElement) {
      followUpTimer = window.setTimeout(() => {
        followUpTimer = null;
        if (focusedTarget === target && !pipelineBypassed) {
          adjustForTarget(target);
        }
      }, 120);
    }

    function scheduleAdjust(target: HTMLElement) {
      cancelAdjustPending();
      cancelFocusOutCheck();
      focusedTarget = target;
      pipelineBypassed = false;

      adjustRaf = requestAnimationFrame(() => {
        adjustRaf = 0;
        adjustForTarget(target);
        runFollowUpAdjust(target);
      });
    }

    function engageFocusTarget(target: HTMLElement) {
      const scrollContainer = containerRef.current;
      if (!scrollContainer?.contains(target)) return;

      cancelFocusOutCheck();

      if (isInputFullyVisibleInContainer(scrollContainer, target)) {
        clearKeyboardPipelineState();
        focusedTarget = target;
        pipelineBypassed = true;
        return;
      }

      scheduleAdjust(target);
    }

    function teardownFocusSession() {
      focusedTarget = null;
      pipelineBypassed = false;
      cancelFocusOutCheck();
      clearKeyboardPipelineState();
    }

    function handleFocusIn(event: FocusEvent) {
      const target = event.target;
      const scrollContainer = containerRef.current;
      if (!(target instanceof HTMLElement) || !isFocusableInput(target)) return;
      if (!scrollContainer) return;

      engageFocusTarget(target);
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
          engageFocusTarget(document.activeElement);
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
