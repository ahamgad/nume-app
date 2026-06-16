/**
 * Generic picker bottom sheet sizing (NUME Foundation v1).
 *
 * Height = clamp(viewport / 3, content height, viewport − header zone × 2)
 * Bottom padding = tab bar height + safe-area bottom.
 */

export {
  IMMERSIVE_SHEET_HEADER_ZONE,
  IMMERSIVE_SHEET_HEIGHT as PICKER_SHEET_MAX_HEIGHT,
} from "@/lib/layout/immersive-sheet";

/** Minimum picker height — one third of the viewport. */
export const PICKER_SHEET_MIN_HEIGHT = "calc(100dvh / 3)";

/** Bottom inset — tab bar (`h-14`) + safe area. */
export const PICKER_SHEET_BOTTOM_PADDING =
  "calc(3.5rem + env(safe-area-inset-bottom))";

/** Standard top padding between picker header and first content row. */
export const PICKER_SHEET_CONTENT_TOP_PADDING = "pt-4";

/** Show search field when item count exceeds this threshold. */
export const PICKER_SEARCH_ITEM_THRESHOLD = 10;

export function shouldShowPickerSearch(itemCount: number): boolean {
  return itemCount > PICKER_SEARCH_ITEM_THRESHOLD;
}
