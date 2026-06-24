/**
 * Bottom sheet layout tokens (NUME Foundation v1).
 *
 * Sheet header vertical sizing is separate from page headers — see
 * {@link BOTTOM_SHEET_HEADER_BAR_CLASS} vs {@link SCREEN_HEADER_BAR_CLASS}.
 */

import {
  SCREEN_HEADER_HORIZONTAL_PADDING_CLASS,
  SCREEN_HEADER_ITEM_GAP_CLASS,
} from "@/lib/layout/screen-spacing";

/** Unified top corner radius for all bottom sheet variants (px). */
export const BOTTOM_SHEET_TOP_RADIUS_PX = 36;

/** Top-left and top-right corner radius for bottom sheet panels. */
export const BOTTOM_SHEET_TOP_RADIUS_CLASS = "rounded-t-[36px]";

/** Bottom-left and bottom-right corner radius — same token as sheet top radius. */
export const BOTTOM_SHEET_BOTTOM_RADIUS_CLASS = `rounded-b-[${BOTTOM_SHEET_TOP_RADIUS_PX}px]`;

/** Sheet header vertical padding (16px top/bottom). */
export const BOTTOM_SHEET_HEADER_VERTICAL_PADDING_CLASS = "py-4";

/** Sheet header inner bar height — 16px + 44px tallest control + 16px (at 16px root). */
export const BOTTOM_SHEET_HEADER_BAR_HEIGHT_CLASS = "4.75rem";

/** Sheet header inner bar — explicit vertical padding (approved sheet design). */
export const BOTTOM_SHEET_HEADER_BAR_CLASS =
  `flex items-center ${SCREEN_HEADER_HORIZONTAL_PADDING_CLASS} ${BOTTOM_SHEET_HEADER_VERTICAL_PADDING_CLASS} ${SCREEN_HEADER_ITEM_GAP_CLASS}`;

/** Sheet header content zone height (matches rendered sheet header bar). */
export const BOTTOM_SHEET_HEADER_CONTENT_ZONE_HEIGHT_CLASS = "4.75rem";

/**
 * Top padding for headerless sheets — matches sheet header bar height.
 */
export const BOTTOM_SHEET_HEADERLESS_TOP_PADDING_CLASS = "pt-[4.75rem]";
