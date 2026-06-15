"use client";

import {
  useCallback,
  useLayoutEffect,
  useState,
  type RefObject,
} from "react";

import { measurePickerSheetHeightPx } from "@/lib/layout/measure-picker-sheet-height";

export function usePickerSheetHeight(
  open: boolean,
  chromeRef: RefObject<HTMLElement | null>,
  contentRef: RefObject<HTMLElement | null>,
) {
  const [sheetHeightPx, setSheetHeightPx] = useState<number | null>(null);
  const [chromeHeightPx, setChromeHeightPx] = useState(0);

  const measure = useCallback(() => {
    const chrome = chromeRef.current?.offsetHeight ?? 0;
    const content = contentRef.current?.scrollHeight ?? 0;
    setChromeHeightPx(chrome);
    setSheetHeightPx(measurePickerSheetHeightPx(chrome, content));
  }, [chromeRef, contentRef]);

  useLayoutEffect(() => {
    if (!open) return;

    measure();

    const observer = new ResizeObserver(measure);
    if (chromeRef.current) observer.observe(chromeRef.current);
    if (contentRef.current) observer.observe(contentRef.current);

    window.visualViewport?.addEventListener("resize", measure);

    return () => {
      observer.disconnect();
      window.visualViewport?.removeEventListener("resize", measure);
    };
  }, [open, measure, chromeRef, contentRef]);

  const activeSheetHeightPx = open ? sheetHeightPx : null;
  const contentMaxHeightPx =
    activeSheetHeightPx !== null
      ? Math.max(0, activeSheetHeightPx - chromeHeightPx)
      : undefined;

  return { sheetHeightPx: activeSheetHeightPx, contentMaxHeightPx, remeasure: measure };
}
