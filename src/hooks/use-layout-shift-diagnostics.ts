"use client";

import { usePathname } from "next/navigation";
import { type RefObject, useEffect } from "react";

import {
  captureLayoutSnapshot,
  diffLayoutSnapshots,
  LAYOUT_SHIFT_DIAGNOSTICS_ENABLED,
  logLayoutSnapshot,
} from "@/lib/layout/layout-shift-diagnostics";

function isFocusableInput(element: EventTarget | null): element is HTMLElement {
  if (!(element instanceof HTMLElement)) return false;
  if (element.isContentEditable) return true;
  const tag = element.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
}

/**
 * Logs AppShell / header / viewport metrics at screen open, focus, and keyboard
 * presentation. Investigation only — no layout mutations.
 */
export function useLayoutShiftDiagnostics(
  appShellRef: RefObject<HTMLElement | null>,
) {
  const pathname = usePathname();

  useEffect(() => {
    if (!LAYOUT_SHIFT_DIAGNOSTICS_ENABLED) return;

    const appShellEl = appShellRef.current;
    if (!appShellEl) return;

    let focusBaseline: ReturnType<typeof captureLayoutSnapshot> | null = null;
    let keyboardSettleTimer: number | null = null;
    let lastViewportHeight: number | null = null;

    function snap(
      phase: Parameters<typeof captureLayoutSnapshot>[0],
      activeElement?: Element | null,
    ) {
      return captureLayoutSnapshot(phase, {
        pathname,
        activeElement,
        appShellEl: appShellRef.current,
      });
    }

    function emit(phase: Parameters<typeof captureLayoutSnapshot>[0]) {
      const snapshot = snap(phase);
      logLayoutSnapshot(snapshot);
      return snapshot;
    }

    const opened = emit("screen-opened");
    const settledTimer = window.setTimeout(() => {
      const settled = emit("screen-settled");
      diffLayoutSnapshots(opened, settled);
    }, 350);

    function onPointerBeforeFocus(event: Event) {
      if (!isFocusableInput(event.target)) return;
      focusBaseline = snap("before-focus", event.target);
      logLayoutSnapshot(focusBaseline);
    }

    function onFocusIn(event: FocusEvent) {
      if (!isFocusableInput(event.target)) return;

      const target =
        event.target instanceof HTMLElement ? event.target : null;

      if (
        !focusBaseline ||
        focusBaseline.activeId !== (target?.id ?? null)
      ) {
        focusBaseline = snap("before-focus", target);
        logLayoutSnapshot(focusBaseline);
      }

      const immediate = snap("focus-immediate", target);
      logLayoutSnapshot(immediate);
      if (focusBaseline) {
        diffLayoutSnapshots(focusBaseline, immediate);
      }

      requestAnimationFrame(() => {
        const afterRaf = snap("focus-after-raf", target);
        logLayoutSnapshot(afterRaf);
        if (focusBaseline) {
          diffLayoutSnapshots(focusBaseline, afterRaf);
        }
      });

      window.setTimeout(() => {
        const delayed = snap("focus-after-120ms", target);
        logLayoutSnapshot(delayed);
        if (focusBaseline) {
          diffLayoutSnapshots(focusBaseline, delayed);
        }
      }, 120);
    }

    function onViewportChange() {
      const viewport = window.visualViewport;
      if (!viewport) return;

      const snapshot = snap("viewport-resize");
      logLayoutSnapshot(snapshot);
      if (focusBaseline) {
        diffLayoutSnapshots(focusBaseline, snapshot);
      }

      if (keyboardSettleTimer !== null) {
        clearTimeout(keyboardSettleTimer);
      }

      keyboardSettleTimer = window.setTimeout(() => {
        keyboardSettleTimer = null;
        const currentHeight = viewport.height;
        if (lastViewportHeight !== null && currentHeight === lastViewportHeight) {
          const settled = snap("keyboard-settled");
          logLayoutSnapshot(settled);
          if (focusBaseline) {
            diffLayoutSnapshots(focusBaseline, settled);
          }
        }
        lastViewportHeight = currentHeight;
      }, 180);

      lastViewportHeight = viewport.height;
    }

    document.addEventListener("touchstart", onPointerBeforeFocus, true);
    document.addEventListener("mousedown", onPointerBeforeFocus, true);
    document.addEventListener("focusin", onFocusIn, true);
    window.visualViewport?.addEventListener("resize", onViewportChange);
    window.visualViewport?.addEventListener("scroll", onViewportChange);

    return () => {
      clearTimeout(settledTimer);
      if (keyboardSettleTimer !== null) {
        clearTimeout(keyboardSettleTimer);
      }
      document.removeEventListener("touchstart", onPointerBeforeFocus, true);
      document.removeEventListener("mousedown", onPointerBeforeFocus, true);
      document.removeEventListener("focusin", onFocusIn, true);
      window.visualViewport?.removeEventListener("resize", onViewportChange);
      window.visualViewport?.removeEventListener("scroll", onViewportChange);
    };
  }, [appShellRef, pathname]);
}
