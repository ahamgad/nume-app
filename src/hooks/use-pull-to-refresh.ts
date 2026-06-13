import { useCallback, useEffect, useRef, useState } from "react";

const PULL_THRESHOLD = 64;
const MAX_PULL = 112;
const REFRESH_INDICATOR_HEIGHT = 44;

export function usePullToRefresh(onRefresh?: () => Promise<void>) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const elementRef = useRef<HTMLElement | null>(null);
  const startYRef = useRef(0);
  const pullingRef = useRef(false);
  const pullDistanceRef = useRef(0);
  const isRefreshingRef = useRef(false);

  const setPull = useCallback((value: number) => {
    pullDistanceRef.current = value;
    setPullDistance(value);
  }, []);

  const runRefresh = useCallback(async () => {
    if (!onRefresh || isRefreshingRef.current) return;
    isRefreshingRef.current = true;
    setIsRefreshing(true);
    setPull(0);
    try {
      await onRefresh();
    } finally {
      isRefreshingRef.current = false;
      setIsRefreshing(false);
    }
  }, [onRefresh, setPull]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || !onRefresh) return;

    function handleTouchStart(event: TouchEvent) {
      if (element!.scrollTop > 0 || isRefreshingRef.current) return;
      startYRef.current = event.touches[0]?.clientY ?? 0;
      pullingRef.current = true;
    }

    function handleTouchMove(event: TouchEvent) {
      if (!pullingRef.current || element!.scrollTop > 0 || isRefreshingRef.current) {
        return;
      }

      const currentY = event.touches[0]?.clientY ?? 0;
      const delta = currentY - startYRef.current;

      if (delta > 0) {
        event.preventDefault();
        setPull(Math.min(delta * 0.45, MAX_PULL));
      } else {
        setPull(0);
      }
    }

    function handleTouchEnd() {
      if (!pullingRef.current) return;
      pullingRef.current = false;

      if (pullDistanceRef.current >= PULL_THRESHOLD && !isRefreshingRef.current) {
        void runRefresh();
        return;
      }

      setPull(0);
    }

    element.addEventListener("touchstart", handleTouchStart, { passive: true });
    element.addEventListener("touchmove", handleTouchMove, { passive: false });
    element.addEventListener("touchend", handleTouchEnd);
    element.addEventListener("touchcancel", handleTouchEnd);

    return () => {
      element.removeEventListener("touchstart", handleTouchStart);
      element.removeEventListener("touchmove", handleTouchMove);
      element.removeEventListener("touchend", handleTouchEnd);
      element.removeEventListener("touchcancel", handleTouchEnd);
    };
  }, [onRefresh, runRefresh, setPull]);

  const indicatorHeight = isRefreshing
    ? REFRESH_INDICATOR_HEIGHT
    : pullDistance > 0
      ? Math.max(pullDistance, 0)
      : 0;

  return {
    elementRef,
    indicatorHeight,
    isRefreshing,
    isPulling: pullDistance > 0 || isRefreshing,
  };
}
