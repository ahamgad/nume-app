"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { shouldBlockNavigationEdgeSwipe } from "@/lib/navigation/tab-roots";

const EDGE_SWIPE_WIDTH_PX = 24;

/**
 * Blocks iOS interactive edge swipe on tab-root screens only.
 * Stack screens keep native swipe-back; dirty forms are handled by NavigationGuardProvider.
 */
export function NavigationEdgeGuard() {
  const pathname = usePathname();
  const blockEdgeSwipe = shouldBlockNavigationEdgeSwipe(pathname);

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
