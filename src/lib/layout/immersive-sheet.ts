/**
 * Immersive bottom sheet sizing (NUME v1).
 *
 * Sheet height = viewport − (sheet header zone × 2).
 * Uses bottom sheet header bar height, not page header height.
 */

import { BOTTOM_SHEET_HEADER_BAR_HEIGHT_CLASS } from "@/lib/layout/bottom-sheet";

/** Matches in-flow bottom sheet header inner bar. */
export const IMMERSIVE_SHEET_HEADER_BAR = BOTTOM_SHEET_HEADER_BAR_HEIGHT_CLASS;

/** Full sheet header zone including safe area. */
export const IMMERSIVE_SHEET_HEADER_ZONE =
  `calc(${BOTTOM_SHEET_HEADER_BAR_HEIGHT_CLASS} + env(safe-area-inset-top))`;

/** Immersive canvas height — field editor, date picker, etc. */
export const IMMERSIVE_SHEET_HEIGHT =
  `calc(100dvh - (${BOTTOM_SHEET_HEADER_BAR_HEIGHT_CLASS} + env(safe-area-inset-top)) - (${BOTTOM_SHEET_HEADER_BAR_HEIGHT_CLASS} + env(safe-area-inset-top)))`;

/** Visible peek above the sheet (one sheet header zone). */
export const IMMERSIVE_SHEET_TOP_PEEK = IMMERSIVE_SHEET_HEADER_ZONE;
