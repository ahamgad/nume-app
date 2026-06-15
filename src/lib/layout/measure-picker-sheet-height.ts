"use client";

const HEADER_BAR_REM = 3.5;

function readSafeAreaInset(side: "top" | "bottom"): number {
  if (typeof document === "undefined") return 0;

  const probe = document.createElement("div");
  probe.style.cssText = [
    "position:fixed",
    "visibility:hidden",
    "pointer-events:none",
    `padding-${side}:env(safe-area-inset-${side})`,
  ].join(";");
  document.body.appendChild(probe);
  const value =
    parseFloat(getComputedStyle(probe).getPropertyValue(`padding-${side}`)) || 0;
  document.body.removeChild(probe);
  return value;
}

function getRootFontSizePx(): number {
  return parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
}

/** Layout viewport height for picker max/min calculations. */
export function getPickerLayoutViewportHeight(): number {
  return window.innerHeight;
}

/** Maximum picker sheet height in px — viewport − (header zone × 2). */
export function getPickerSheetMaxHeightPx(): number {
  const rootFont = getRootFontSizePx();
  const headerZonePx = rootFont * HEADER_BAR_REM + readSafeAreaInset("top");
  return getPickerLayoutViewportHeight() - headerZonePx * 2;
}

/** Minimum picker sheet height in px — viewport / 3. */
export function getPickerSheetMinHeightPx(): number {
  return getPickerLayoutViewportHeight() / 3;
}

/** Tab bar + safe-area bottom padding in px. */
export function getPickerSheetBottomPaddingPx(): number {
  const rootFont = getRootFontSizePx();
  return rootFont * HEADER_BAR_REM + readSafeAreaInset("bottom");
}

/**
 * Content-fitted picker height.
 * clamp(viewport / 3, chrome + content + bottom pad, immersive max)
 */
export function measurePickerSheetHeightPx(
  chromePx: number,
  contentScrollPx: number,
): number {
  const minPx = getPickerSheetMinHeightPx();
  const maxPx = getPickerSheetMaxHeightPx();
  const bottomPadPx = getPickerSheetBottomPaddingPx();
  const naturalTotal = chromePx + contentScrollPx + bottomPadPx;
  return Math.min(Math.max(naturalTotal, minPx), maxPx);
}
