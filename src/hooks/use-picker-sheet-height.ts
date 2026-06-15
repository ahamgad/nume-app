"use client";

import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from "react";

import { measurePickerSheetHeightPx } from "@/lib/layout/measure-picker-sheet-height";

export function usePickerSheetHeight(
  open: boolean,
  chromeRef: RefObject<HTMLElement | null>,
  contentRef: RefObject<HTMLElement | null>,
  /** When true, height is calculated once on open and never recomputed for filtered results. */
  lockHeightAfterInitialMeasure = false,
) {
  const [sheetHeightPx, setSheetHeightPx] = useState<number | null>(null);
  const [chromeHeightPx, setChromeHeightPx] = useState(0);
  const heightLockedRef = useRef(false);

  const applyMeasure = useCallback(() => {
    const chrome = chromeRef.current?.offsetHeight ?? 0;
    const content = contentRef.current?.scrollHeight ?? 0;
    setChromeHeightPx(chrome);
    setSheetHeightPx(measurePickerSheetHeightPx(chrome, content));
  }, [chromeRef, contentRef]);

  const measureAndMaybeLock = useCallback(() => {
    if (lockHeightAfterInitialMeasure && heightLockedRef.current) return;
    applyMeasure();
    if (lockHeightAfterInitialMeasure) {
      heightLockedRef.current = true;
    }
  }, [applyMeasure, lockHeightAfterInitialMeasure]);

  useLayoutEffect(() => {
    if (!open) return;

    heightLockedRef.current = false;
    measureAndMaybeLock();

    if (lockHeightAfterInitialMeasure) {
      return;
    }

    const observer = new ResizeObserver(measureAndMaybeLock);
    if (chromeRef.current) observer.observe(chromeRef.current);
    if (contentRef.current) observer.observe(contentRef.current);

    const onViewportResize = () => measureAndMaybeLock();
    window.visualViewport?.addEventListener("resize", onViewportResize);

    return () => {
      observer.disconnect();
      window.visualViewport?.removeEventListener("resize", onViewportResize);
    };
  }, [
    open,
    lockHeightAfterInitialMeasure,
    measureAndMaybeLock,
    chromeRef,
    contentRef,
  ]);

  const activeSheetHeightPx = open ? sheetHeightPx : null;
  const contentMaxHeightPx =
    activeSheetHeightPx !== null
      ? Math.max(0, activeSheetHeightPx - chromeHeightPx)
      : undefined;

  return { sheetHeightPx: activeSheetHeightPx, contentMaxHeightPx };
}
