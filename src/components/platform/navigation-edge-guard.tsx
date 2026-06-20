"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { shouldBlockNavigationEdgeSwipe } from "@/lib/navigation/back-navigation-policy";
import { useIsNavigationDirty } from "@/providers/navigation-guard-provider";

const EDGE_SWIPE_WIDTH_PX = 24;

/**
 * Blocks iOS interactive edge swipe on tab roots, dirty screens, and
 * stack screens that require explicit back navigation (e.g. Appearance).
 */
export function NavigationEdgeGuard() {
  const pathname = usePathname();
  const isNavigationDirty = useIsNavigationDirty();
  const blockEdgeSwipe = shouldBlockNavigationEdgeSwipe(
    pathname,
    isNavigationDirty,
  );

  useEffect(() => {
    if (!blockEdgeSwipe) return;

    function isNavigationEdge(touch: Touch) {
      return (
        touch.clientX <= EDGE_SWIPE_WIDTH_PX ||
        touch.clientX >= window.innerWidth - EDGE_SWIPE_WIDTH_PX
      );
    }

    function handleTouchStart(event: TouchEvent) {
      const touch = event.touches[0];
      if (!touch || !isNavigationEdge(touch)) return;
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
  }, [blockEdgeSwipe]);

  if (!blockEdgeSwipe) return null;

  return (
    <>
      <div
        aria-hidden
        className="fixed inset-y-0 start-0 z-[100] w-6 touch-none"
      />
      <div
        aria-hidden
        className="fixed inset-y-0 end-0 z-[100] w-6 touch-none"
      />
    </>
  );
}
