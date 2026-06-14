"use client";

import { useCallback, useEffect } from "react";

interface UseDirtyFormNavigationOptions {
  isDirty: boolean;
  enabled?: boolean;
}

const EDGE_SWIPE_WIDTH_PX = 24;

/**
 * Dirty form navigation (NUME platform — frozen before Gold).
 *
 * Root cause of swipe-back flash: `popstate` fires after iOS begins the interactive
 * back transition. Re-pushing history cannot cancel an animation already in flight.
 *
 * Rule: when a form is dirty, disable interactive edge-swipe entirely. Only the
 * header back button opens the discard sheet, then `router.back()` on confirm.
 */
export function useDirtyFormNavigation({
  isDirty,
  enabled = true,
}: UseDirtyFormNavigationOptions) {
  useEffect(() => {
    if (!enabled || !isDirty) return;

    function isEdgeSwipe(touch: Touch) {
      const isRtl = document.documentElement.dir === "rtl";
      const edgeDistance = isRtl
        ? window.innerWidth - touch.clientX
        : touch.clientX;
      return edgeDistance <= EDGE_SWIPE_WIDTH_PX;
    }

    function handleTouchStart(event: TouchEvent) {
      const touch = event.touches[0];
      if (!touch || !isEdgeSwipe(touch)) return;
      event.preventDefault();
    }

    const previousOverscroll = document.documentElement.style.overscrollBehaviorX;
    document.documentElement.style.overscrollBehaviorX = "none";
    document.addEventListener("touchstart", handleTouchStart, {
      capture: true,
      passive: false,
    });

    return () => {
      document.documentElement.style.overscrollBehaviorX = previousOverscroll;
      document.removeEventListener("touchstart", handleTouchStart, {
        capture: true,
      });
    };
  }, [enabled, isDirty]);

  /** Call before router.back() when the user confirms discarding changes. */
  const confirmDiscardNavigation = useCallback((navigateBack: () => void) => {
    navigateBack();
  }, []);

  return {
    confirmDiscardNavigation,
    showEdgeGuard: enabled && isDirty,
  };
}
