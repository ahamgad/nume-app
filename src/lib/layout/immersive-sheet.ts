/**
 * Immersive bottom sheet sizing (NUME v1).
 *
 * Sheet height = viewport − (ScreenHeader zone × 2).
 * ScreenHeader zone = safe-area top + inner header bar.
 *
 * Bottom-anchored, this leaves one header zone visible above the sheet.
 */

import { SCREEN_HEADER_BAR_HEIGHT_CLASS } from "@/lib/layout/screen-spacing";

/** Matches in-flow ScreenHeader inner bar. */
export const IMMERSIVE_SHEET_HEADER_BAR = SCREEN_HEADER_BAR_HEIGHT_CLASS;

/** Full ScreenHeader zone including safe area. */
export const IMMERSIVE_SHEET_HEADER_ZONE =
  `calc(${SCREEN_HEADER_BAR_HEIGHT_CLASS} + env(safe-area-inset-top))`;

/** Immersive canvas height — field editor, date picker, etc. */
export const IMMERSIVE_SHEET_HEIGHT =
  `calc(100dvh - (${SCREEN_HEADER_BAR_HEIGHT_CLASS} + env(safe-area-inset-top)) - (${SCREEN_HEADER_BAR_HEIGHT_CLASS} + env(safe-area-inset-top)))`;

/** Visible peek above the sheet (one ScreenHeader zone). */
export const IMMERSIVE_SHEET_TOP_PEEK = IMMERSIVE_SHEET_HEADER_ZONE;
