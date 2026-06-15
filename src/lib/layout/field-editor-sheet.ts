/**
 * Field editor immersive canvas sizing (NUME v1).
 *
 * Sheet height = viewport − (ScreenHeader zone × 2).
 * ScreenHeader zone = safe-area top + h-14 (3.5rem).
 *
 * Bottom-anchored, this leaves one header zone visible above the sheet.
 */

/** Matches in-flow ScreenHeader inner bar (`h-14`). */
export const FIELD_EDITOR_HEADER_BAR = "3.5rem";

/** Full ScreenHeader zone including safe area. */
export const FIELD_EDITOR_HEADER_ZONE =
  "calc(3.5rem + env(safe-area-inset-top))";

/** Immersive editing canvas height. */
export const FIELD_EDITOR_SHEET_HEIGHT =
  "calc(100dvh - (3.5rem + env(safe-area-inset-top)) - (3.5rem + env(safe-area-inset-top)))";

/** Visible peek above the sheet (one ScreenHeader zone). */
export const FIELD_EDITOR_SHEET_TOP_PEEK = FIELD_EDITOR_HEADER_ZONE;
