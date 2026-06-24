"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties, type TransitionEvent } from "react";

import { useModalLayer } from "@/providers/modal-layer-provider";
import { useConnectivity } from "@/providers/connectivity-provider";
import { NUME_MOTION_EASE } from "@/lib/layout/motion";
import { PULL_TO_REFRESH_MAX_VISUAL_OFFSET_PX, PULL_TO_REFRESH_SNAP_BACK_MS } from "@/lib/layout/pull-to-refresh";

/** Visual offset required to trigger refresh after release. */
const PULL_THRESHOLD = 56;
/** Offset held while refresh runs and during snap-back start. */
const HOLD_OFFSET = 52;
/** Maximum visual pull distance. */
const MAX_OFFSET = PULL_TO_REFRESH_MAX_VISUAL_OFFSET_PX;
/** Downward finger travel before committing to a pull gesture. */
const PULL_ACTIVATION = 10;
const RESISTANCE_SCALE = 80;
const RESISTANCE_DIM = 0.5;
const SNAP_BACK_MS = PULL_TO_REFRESH_SNAP_BACK_MS;

function applyResistance(rawDelta: number): number {
  if (rawDelta <= 0) return 0;
  const resisted =
    (rawDelta * RESISTANCE_SCALE) / (rawDelta + RESISTANCE_SCALE * RESISTANCE_DIM);
  return Math.min(resisted, MAX_OFFSET);
}

function isAtScrollTop(scrollContainer: HTMLElement): boolean {
  if (scrollContainer.scrollTop > 0) return false;

  if (typeof window !== "undefined") {
    if (window.scrollY > 0) return false;
    if (document.documentElement.scrollTop > 0) return false;
    if (document.body.scrollTop > 0) return false;
  }

  return true;
}

export function usePullToRefresh(onRefresh?: () => Promise<void>) {
  const { isModalOpen } = useModalLayer();
  const { isOnline, signalOffline } = useConnectivity();
  const [offset, setOffset] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const elementRef = useRef<HTMLElement | null>(null);
  const isModalOpenRef = useRef(isModalOpen);
  const startYRef = useRef(0);
  /** Touch began while the scroll container was at the top. */
  const startedAtTopRef = useRef(false);
  /** Pull gesture is actively driving translateY / preventDefault. */
  const isPullingRef = useRef(false);
  const isRefreshingRef = useRef(false);
  const offsetRef = useRef(0);
  const onRefreshRef = useRef(onRefresh);

  useEffect(() => {
    onRefreshRef.current = onRefresh;
  }, [onRefresh]);

  useEffect(() => {
    isModalOpenRef.current = isModalOpen;
  }, [isModalOpen]);

  useEffect(() => {
    offsetRef.current = offset;
  }, [offset]);

  const resetPull = useCallback(() => {
    isPullingRef.current = false;
    startedAtTopRef.current = false;
    offsetRef.current = 0;
    setOffset(0);
    setIsAnimating(false);
  }, []);

  const snapBack = useCallback(() => {
    if (offsetRef.current <= 0) {
      resetPull();
      return;
    }

    isPullingRef.current = false;
    startedAtTopRef.current = false;
    setIsAnimating(true);
    requestAnimationFrame(() => {
      offsetRef.current = 0;
      setOffset(0);
    });
  }, [resetPull]);

  const runRefresh = useCallback(async () => {
    if (!onRefreshRef.current || isRefreshingRef.current) return;

    if (!isOnline) {
      isPullingRef.current = false;
      startedAtTopRef.current = false;
      resetPull();
      signalOffline();
      return;
    }

    isRefreshingRef.current = true;
    isPullingRef.current = false;
    startedAtTopRef.current = false;
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
  }, [isOnline, resetPull, signalOffline, snapBack]);

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
    if (!element || !onRefresh || isModalOpen) return;

    function handleTouchStart(event: TouchEvent) {
      if (isModalOpenRef.current || isRefreshingRef.current) return;

      if (!isAtScrollTop(element!)) {
        startedAtTopRef.current = false;
        isPullingRef.current = false;
        return;
      }

      startYRef.current = event.touches[0]?.clientY ?? 0;
      startedAtTopRef.current = true;
      isPullingRef.current = false;
      setIsAnimating(false);
    }

    function handleTouchMove(event: TouchEvent) {
      if (isModalOpenRef.current || isRefreshingRef.current) return;

      if (!isAtScrollTop(element!)) {
        if (isPullingRef.current || offsetRef.current > 0) {
          resetPull();
        } else {
          startedAtTopRef.current = false;
          isPullingRef.current = false;
        }
        return;
      }

      if (!startedAtTopRef.current) return;

      const rawDelta = (event.touches[0]?.clientY ?? 0) - startYRef.current;

      if (rawDelta <= 0) {
        if (isPullingRef.current || offsetRef.current > 0) {
          resetPull();
        }
        return;
      }

      if (rawDelta <= PULL_ACTIVATION) return;

      isPullingRef.current = true;
      event.preventDefault();

      const distance = applyResistance(rawDelta);
      offsetRef.current = distance;
      setOffset(distance);
      setIsAnimating(false);
    }

    function handleTouchEnd() {
      if (isModalOpenRef.current || isRefreshingRef.current) return;

      if (!isPullingRef.current && offsetRef.current <= 0) {
        startedAtTopRef.current = false;
        return;
      }

      const shouldRefresh =
        offsetRef.current >= PULL_THRESHOLD && !isRefreshingRef.current;

      isPullingRef.current = false;
      startedAtTopRef.current = false;

      if (shouldRefresh) {
        if (!isOnline) {
          resetPull();
          signalOffline();
          return;
        }
        void runRefresh();
        return;
      }

      snapBack();
    }

    function handleTouchCancel() {
      if (isModalOpenRef.current || isRefreshingRef.current) return;

      if (!isPullingRef.current && offsetRef.current <= 0) {
        startedAtTopRef.current = false;
        return;
      }

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
  }, [isModalOpen, isOnline, onRefresh, resetPull, runRefresh, signalOffline, snapBack]);

  const activeOffset = isModalOpen ? 0 : offset;
  const activeAnimating = isModalOpen ? false : isAnimating;

  const showIndicator = !isModalOpen && (isRefreshing || activeOffset > 0);

  const indicatorOpacity = isRefreshing
    ? 1
    : Math.min(activeOffset / PULL_THRESHOLD, 1);

  const contentStyle: CSSProperties =
    activeOffset > 0 || activeAnimating
      ? {
          transform: `translate3d(0, ${activeOffset}px, 0)`,
          transition: activeAnimating
            ? `transform ${SNAP_BACK_MS}ms ${NUME_MOTION_EASE}`
            : undefined,
        }
      : {};

  return {
    elementRef,
    isRefreshing,
    isAnimating: activeAnimating,
    showIndicator,
    indicatorOpacity,
    offset: activeOffset,
    contentStyle,
    handleTransitionEnd,
  };
}
