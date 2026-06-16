/**
 * Shared screen layout spacing (NUME v1).
 *
 * All scrollable in-app screens use the same bottom inset so content never
 * feels flush with the bottom edge. Tab-root screens reserve this space for
 * the fixed tab bar; stack screens use the same inset for perceived consistency.
 */

/** Matches TabBar `h-14` (3.5rem). */
export const TAB_BAR_HEIGHT_CLASS = "3.5rem";

/** Standard scroll padding — tab bar height + safe area. */
export const TAB_BAR_SCROLL_PADDING =
  "pb-[calc(3.5rem+env(safe-area-inset-bottom))]";

/** @deprecated Use {@link TAB_BAR_SCROLL_PADDING}. */
export const TAB_SCREEN_BOTTOM_PADDING = TAB_BAR_SCROLL_PADDING;

/** Stack/detail screens use the same inset for consistent bottom breathing room. */
export const STACK_SCREEN_BOTTOM_PADDING = TAB_BAR_SCROLL_PADDING;

/** Bottom inset when a sticky footer action bar is present (no tab bar). */
export const STICKY_FOOTER_BOTTOM_PADDING =
  "pb-[calc(5.5rem+env(safe-area-inset-bottom))]";

/** Sticky footer + fixed tab bar. */
export const STICKY_FOOTER_TAB_BAR_PADDING =
  "pb-[calc(9rem+env(safe-area-inset-bottom))]";

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
