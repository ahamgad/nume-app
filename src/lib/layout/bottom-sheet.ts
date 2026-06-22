/**
 * Bottom sheet layout tokens (NUME Foundation v1).
 *
 * Panel chrome classes live in `bottom-sheet-chrome.tsx`; numeric and string
 * tokens used by height calculations and tests live here.
 */

import { SCREEN_HEADER_CONTENT_ZONE_TOP_PADDING_CLASS } from "@/lib/layout/screen-spacing";

/** Unified top corner radius for all bottom sheet variants (px). */
export const BOTTOM_SHEET_TOP_RADIUS_PX = 36;

/** Top-left and top-right corner radius for bottom sheet panels. */
export const BOTTOM_SHEET_TOP_RADIUS_CLASS = "rounded-t-[36px]";

/**
 * Top padding for headerless sheets — matches page header content zone
 * ({@link SCREEN_HEADER_CONTENT_ZONE_TOP_PADDING_CLASS}).
 */
export const BOTTOM_SHEET_HEADERLESS_TOP_PADDING_CLASS =
  SCREEN_HEADER_CONTENT_ZONE_TOP_PADDING_CLASS;

/** Matches in-flow sheet header inner bar (`h-14`). */
export { SCREEN_HEADER_BAR_HEIGHT_CLASS as BOTTOM_SHEET_HEADER_BAR_HEIGHT_CLASS } from "@/lib/layout/screen-spacing";

export {
  SCREEN_HEADER_CONTENT_ZONE_HEIGHT_CLASS as BOTTOM_SHEET_HEADER_CONTENT_ZONE_HEIGHT_CLASS,
  SCREEN_HEADER_CONTENT_ZONE_TOP_PADDING_CLASS,
} from "@/lib/layout/screen-spacing";
