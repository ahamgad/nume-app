/**
 * Bottom sheet layout tokens (NUME Foundation v1).
 *
 * Panel chrome classes live in `bottom-sheet-chrome.tsx`; numeric and string
 * tokens used by height calculations and tests live here.
 */

/** Unified top corner radius for all bottom sheet variants (px). */
export const BOTTOM_SHEET_TOP_RADIUS_PX = 36;

/** Top-left and top-right corner radius for bottom sheet panels. */
export const BOTTOM_SHEET_TOP_RADIUS_CLASS = "rounded-t-[36px]";

/**
 * Top padding for headerless sheets — matches the standard sheet header bar
 * (`h-14` / {@link SCREEN_HEADER_BAR_HEIGHT_CLASS}).
 */
export const BOTTOM_SHEET_HEADERLESS_TOP_PADDING_CLASS = "pt-14";

/** Matches in-flow sheet header inner bar (`h-14`). */
export { SCREEN_HEADER_BAR_HEIGHT_CLASS as BOTTOM_SHEET_HEADER_BAR_HEIGHT_CLASS } from "@/lib/layout/screen-spacing";
