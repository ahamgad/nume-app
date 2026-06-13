import { useCallback, useEffect, useRef, useState } from "react";

/** Finger travel required to trigger refresh (1:1 with pull distance). */
const PULL_THRESHOLD = 52;
const MAX_PULL = 88;
/** Show spinner feedback once the user has pulled this far. */
const PULL_HINT = 12;

export function usePullToRefresh(onRefresh?: () => Promise<void>) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const elementRef = useRef<HTMLElement | null>(null);
  const startYRef = useRef(0);
  const isPullingRef = useRef(false);
  const isRefreshingRef = useRef(false);
  const pullDistanceRef = useRef(0);
  const onRefreshRef = useRef(onRefresh);

  useEffect(() => {
    onRefreshRef.current = onRefresh;
  }, [onRefresh]);

  const runRefresh = useCallback(async () => {
    if (!onRefreshRef.current || isRefreshingRef.current) return;

    isRefreshingRef.current = true;
    isPullingRef.current = false;
    pullDistanceRef.current = 0;
    setPullDistance(0);
    setIsRefreshing(true);

    try {
      await onRefreshRef.current();
    } finally {
      isRefreshingRef.current = false;
      setIsRefreshing(false);
      isPullingRef.current = false;
      pullDistanceRef.current = 0;
      setPullDistance(0);
    }
  }, []);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || !onRefresh) return;

    function handleTouchStart(event: TouchEvent) {
      if (isRefreshingRef.current || element!.scrollTop > 0) return;
      startYRef.current = event.touches[0]?.clientY ?? 0;
      isPullingRef.current = true;
    }

    function handleTouchMove(event: TouchEvent) {
      if (isRefreshingRef.current) return;

      if (!isPullingRef.current) return;

      if (element!.scrollTop > 0) {
        isPullingRef.current = false;
        pullDistanceRef.current = 0;
        setPullDistance(0);
        return;
      }

      const delta = (event.touches[0]?.clientY ?? 0) - startYRef.current;

      if (delta <= 0) {
        pullDistanceRef.current = 0;
        setPullDistance(0);
        return;
      }

      if (delta > PULL_HINT) {
        event.preventDefault();
      }

      const distance = Math.min(delta, MAX_PULL);
      pullDistanceRef.current = distance;
      setPullDistance(distance);
    }

    function handleTouchEnd() {
      if (!isPullingRef.current) return;

      const shouldRefresh =
        pullDistanceRef.current >= PULL_THRESHOLD && !isRefreshingRef.current;

      isPullingRef.current = false;
      pullDistanceRef.current = 0;
      setPullDistance(0);

      if (shouldRefresh) {
        void runRefresh();
      }
    }

    function handleTouchCancel() {
      isPullingRef.current = false;
      pullDistanceRef.current = 0;
      setPullDistance(0);
    }

    element.addEventListener("touchstart", handleTouchStart, { passive: true });
    element.addEventListener("touchmove", handleTouchMove, { passive: false });
    element.addEventListener("touchend", handleTouchEnd, { passive: true });
    element.addEventListener("touchcancel", handleTouchCancel, { passive: true });

    return () => {
      element.removeEventListener("touchstart", handleTouchStart);
      element.removeEventListener("touchmove", handleTouchMove);
      element.removeEventListener("touchend", handleTouchEnd);
      element.removeEventListener("touchcancel", handleTouchCancel);
    };
  }, [onRefresh, runRefresh]);

  const showIndicator =
    isRefreshing || pullDistance >= PULL_HINT;

  const indicatorOpacity = isRefreshing
    ? 1
    : Math.min(pullDistance / PULL_THRESHOLD, 1);

  return {
    elementRef,
    isRefreshing,
    showIndicator,
    indicatorOpacity,
  };
}
