"use client";

import { useEffect } from "react";

const EDGE_SWIPE_WIDTH_PX = 24;

/**
 * Disables iOS interactive edge swipe back/forward app-wide.
 * Programmatic navigation via header back buttons remains unchanged.
 */
export function NavigationEdgeGuard() {
  useEffect(() => {
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
  }, []);

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
