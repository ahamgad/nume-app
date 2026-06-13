import { useCallback, useEffect, useRef, useState, type CSSProperties, type TransitionEvent } from "react";

/** Visual offset required to trigger refresh after release. */
const PULL_THRESHOLD = 56;
/** Offset held while refresh runs and during snap-back start. */
const HOLD_OFFSET = 52;
/** Maximum visual pull distance. */
const MAX_OFFSET = 88;
/** Finger travel before we take over the gesture (avoids blocking scroll). */
const PULL_ACTIVATION = 10;
const RESISTANCE_SCALE = 80;
const RESISTANCE_DIM = 0.5;
const SNAP_BACK_MS = 280;

function applyResistance(rawDelta: number): number {
  if (rawDelta <= 0) return 0;
  const resisted =
    (rawDelta * RESISTANCE_SCALE) / (rawDelta + RESISTANCE_SCALE * RESISTANCE_DIM);
  return Math.min(resisted, MAX_OFFSET);
}

export function usePullToRefresh(onRefresh?: () => Promise<void>) {
  const [offset, setOffset] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const elementRef = useRef<HTMLElement | null>(null);
  const startYRef = useRef(0);
  const isActiveRef = useRef(false);
  const isRefreshingRef = useRef(false);
  const offsetRef = useRef(0);
  const onRefreshRef = useRef(onRefresh);

  useEffect(() => {
    onRefreshRef.current = onRefresh;
  }, [onRefresh]);

  useEffect(() => {
    offsetRef.current = offset;
  }, [offset]);

  const snapBack = useCallback(() => {
    setIsAnimating(true);
    requestAnimationFrame(() => {
      offsetRef.current = 0;
      setOffset(0);
    });
  }, []);

  const runRefresh = useCallback(async () => {
    if (!onRefreshRef.current || isRefreshingRef.current) return;

    isRefreshingRef.current = true;
    isActiveRef.current = false;
    setIsRefreshing(true);
    setIsAnimating(true);
    setOffset(HOLD_OFFSET);
    offsetRef.current = HOLD_OFFSET;

    try {
      await onRefreshRef.current();
    } finally {
      isRefreshingRef.current = false;
      setIsRefreshing(false);
      snapBack();
    }
  }, [snapBack]);

  const handleTransitionEnd = useCallback(
    (event: TransitionEvent<HTMLDivElement>) => {
      if (event.propertyName !== "transform") return;
      if (offsetRef.current === 0) {
        setIsAnimating(false);
      }
    },
    [],
  );

  useEffect(() => {
    const element = elementRef.current;
    if (!element || !onRefresh) return;

    function handleTouchStart(event: TouchEvent) {
      if (isRefreshingRef.current || element!.scrollTop > 0) return;

      startYRef.current = event.touches[0]?.clientY ?? 0;
      isActiveRef.current = true;
      setIsAnimating(false);
    }

    function handleTouchMove(event: TouchEvent) {
      if (isRefreshingRef.current) return;
      if (!isActiveRef.current) return;

      if (element!.scrollTop > 0) {
        isActiveRef.current = false;
        offsetRef.current = 0;
        setOffset(0);
        setIsAnimating(false);
        return;
      }

      const rawDelta = (event.touches[0]?.clientY ?? 0) - startYRef.current;

      if (rawDelta <= 0) {
        offsetRef.current = 0;
        setOffset(0);
        setIsAnimating(false);
        return;
      }

      if (rawDelta > PULL_ACTIVATION) {
        event.preventDefault();
      }

      const distance = applyResistance(rawDelta);
      offsetRef.current = distance;
      setOffset(distance);
      setIsAnimating(false);
    }

    function handleTouchEnd() {
      if (!isActiveRef.current) return;

      isActiveRef.current = false;

      const shouldRefresh =
        offsetRef.current >= PULL_THRESHOLD && !isRefreshingRef.current;

      if (shouldRefresh) {
        void runRefresh();
        return;
      }

      snapBack();
    }

    function handleTouchCancel() {
      if (!isActiveRef.current) return;

      isActiveRef.current = false;

      if (isRefreshingRef.current) return;

      snapBack();
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
  }, [onRefresh, runRefresh, snapBack]);

  const showIndicator = isRefreshing || offset > 0;

  const indicatorOpacity = isRefreshing
    ? 1
    : Math.min(offset / PULL_THRESHOLD, 1);

  const contentStyle: CSSProperties =
    offset > 0 || isAnimating
      ? {
          transform: `translate3d(0, ${offset}px, 0)`,
          transition: isAnimating
            ? `transform ${SNAP_BACK_MS}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`
            : undefined,
        }
      : {};

  return {
    elementRef,
    isRefreshing,
    isAnimating,
    showIndicator,
    indicatorOpacity,
    offset,
    contentStyle,
    handleTransitionEnd,
  };
}
