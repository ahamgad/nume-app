/**
 * Shared screen layout spacing (NUME v1).
 *
 * Tab-root screens reserve double the tab bar height so content never feels
 * attached to the fixed tab bar. Stack screens use a single tab-bar-height inset.
 */

/** Matches TabBar `h-14` (3.5rem). */
export const TAB_BAR_HEIGHT_CLASS = "3.5rem";

/** Tab-root scroll padding — tab bar height + equal breathing room + safe area. */
export const TAB_BAR_SCROLL_PADDING =
  "pb-[calc(7rem+env(safe-area-inset-bottom))]";

/** @deprecated Use {@link TAB_BAR_SCROLL_PADDING}. */
export const TAB_SCREEN_BOTTOM_PADDING = TAB_BAR_SCROLL_PADDING;

/** Stack/detail screens — single tab-bar-height inset + safe area. */
export const STACK_SCREEN_BOTTOM_PADDING =
  "pb-[calc(3.5rem+env(safe-area-inset-bottom))]";

/** Bottom inset when a sticky footer action bar is present (no tab bar). */
export const STICKY_FOOTER_BOTTOM_PADDING =
  "pb-[calc(5.5rem+env(safe-area-inset-bottom))]";

/** Sticky footer + fixed tab bar. */
export const STICKY_FOOTER_TAB_BAR_PADDING =
  "pb-[calc(9rem+env(safe-area-inset-bottom))]";

/** Matches in-flow ScreenHeader inner bar (`h-14`). */
export const SCREEN_HEADER_BAR_HEIGHT_CLASS = "3.5rem";

/** Full ScreenHeader zone including safe area (bottom edge of fixed header). */
export const SCREEN_HEADER_ZONE_TOP =
  "calc(3.5rem + env(safe-area-inset-top))";

/** Shared top offset for toasts, banners, and global system messages — 4px below header. */
export const SYSTEM_MESSAGE_GAP_PX = "4px";

export const SYSTEM_MESSAGE_TOP_OFFSET = `calc(${SCREEN_HEADER_ZONE_TOP} + ${SYSTEM_MESSAGE_GAP_PX})`;

/** Horizontal inset for edge-to-edge system message bars (4px each side). */
export const SYSTEM_MESSAGE_HORIZONTAL_INSET_PX = "4px";

/** Tailwind class — full width minus 4px left/right. */
export const SYSTEM_MESSAGE_INSET_X_CLASS = "inset-x-1";

/** Tailwind arbitrary value class for fixed system-message surfaces. */
export const SYSTEM_MESSAGE_TOP_CLASS =
  "top-[calc(3.5rem+env(safe-area-inset-top)+4px)]";

/**
 * Diagnostic: compensates for fixed ScreenHeader (h-14 + safe area + ScreenBody pt-4).
 */
export const FIXED_HEADER_BODY_TOP_PADDING =
  "pt-[calc(3.5rem+env(safe-area-inset-top)+1rem)]";

export function getScreenBodyTopPadding(fixedHeader: boolean): string {
  return fixedHeader ? FIXED_HEADER_BODY_TOP_PADDING : "pt-4";
}

export function getScreenBodyScrollPadding(options: {
  tabBarVisible: boolean;
  withStickyFooter: boolean;
}): string {
  if (options.withStickyFooter) {
    return options.tabBarVisible
      ? STICKY_FOOTER_TAB_BAR_PADDING
      : STICKY_FOOTER_BOTTOM_PADDING;
  }
  if (options.tabBarVisible) return TAB_BAR_SCROLL_PADDING;
  return STACK_SCREEN_BOTTOM_PADDING;
}
