"use client";

import { type RefObject, useEffect, useRef } from "react";

import { useKeyboard } from "@/providers/keyboard-provider";

const HEADER_CLEARANCE_PX = 56;
const SPACER_ID = "nume-keyboard-spacer";

function isScrollTarget(element: HTMLElement): boolean {
  if (element.isContentEditable) return true;
  const tag = element.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
}

function getOrCreateSpacer(container: HTMLElement): HTMLDivElement {
  let spacer = container.querySelector<HTMLDivElement>(`#${SPACER_ID}`);
  if (!spacer) {
    spacer = document.createElement("div");
    spacer.id = SPACER_ID;
    spacer.setAttribute("aria-hidden", "true");
    spacer.style.width = "100%";
    spacer.style.flexShrink = "0";
    container.appendChild(spacer);
  }
  return spacer;
}

function removeSpacer(container: HTMLElement) {
  container.querySelector(`#${SPACER_ID}`)?.remove();
}

interface UseKeyboardScrollOptions {
  enabled?: boolean;
  /** Visible area reserved below the focused field (CTA/footer). */
  bottomReservePx?: number;
}

/**
 * NUME keyboard scroll strategy (Phase 3.5):
 * - Keyboard overlays the bottom naturally (no screen resize, no CTA lift).
 * - Focused input scrolls directly below the fixed header.
 * - Temporary spacer when the field sits near the bottom.
 * - Manual scrolling disabled while the keyboard is open.
 */
export function useKeyboardScroll(
  containerRef: RefObject<HTMLElement | null>,
  { enabled = true, bottomReservePx = 16 }: UseKeyboardScrollOptions = {},
) {
  const { isOpen, keyboardInset } = useKeyboard();
  const activeTargetRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const container = containerRef.current;
    if (!container) return;

    if (isOpen) {
      container.style.overflow = "hidden";
      container.style.touchAction = "none";
    } else {
      container.style.overflow = "";
      container.style.touchAction = "";
      removeSpacer(container);
      activeTargetRef.current = null;
    }
  }, [containerRef, enabled, isOpen]);

  useEffect(() => {
    if (!enabled) return;
    const container = containerRef.current;
    if (!container) return;

    function positionFocusedField(target: HTMLElement) {
      const vv = window.visualViewport;
      const visibleTop = (vv?.offsetTop ?? 0) + HEADER_CLEARANCE_PX + 8;
      const visibleBottom =
        (vv?.height ?? window.innerHeight) - bottomReservePx - 8;
      const rect = target.getBoundingClientRect();

      if (rect.top < visibleTop) {
        container!.scrollTop -= visibleTop - rect.top;
      }

      const overlap = rect.bottom - visibleBottom;
      if (overlap > 0) {
        container!.scrollTop += overlap;
        const spacer = getOrCreateSpacer(container!);
        const remainingOverlap =
          target.getBoundingClientRect().bottom - visibleBottom;
        spacer.style.height =
          remainingOverlap > 0 ? `${Math.ceil(remainingOverlap + 16)}px` : "0px";
      } else {
        const spacer = container!.querySelector<HTMLDivElement>(`#${SPACER_ID}`);
        if (spacer) spacer.style.height = "0px";
      }
    }

    function handleFocusIn(event: FocusEvent) {
      const target = event.target;
      if (!(target instanceof HTMLElement) || !isScrollTarget(target)) return;
      activeTargetRef.current = target;
      requestAnimationFrame(() => positionFocusedField(target));
    }

    function handleViewportChange() {
      const target = activeTargetRef.current;
      if (target && isOpen) {
        requestAnimationFrame(() => positionFocusedField(target));
      }
    }

    container.addEventListener("focusin", handleFocusIn);
    window.visualViewport?.addEventListener("resize", handleViewportChange);
    window.visualViewport?.addEventListener("scroll", handleViewportChange);

    return () => {
      container.removeEventListener("focusin", handleFocusIn);
      window.visualViewport?.removeEventListener("resize", handleViewportChange);
      window.visualViewport?.removeEventListener("scroll", handleViewportChange);
    };
  }, [bottomReservePx, containerRef, enabled, isOpen, keyboardInset]);
}
