/**
 * Shared screen layout spacing (NUME v1).
 *
 * Tab screens reserve space for the fixed tab bar + safe area.
 * Stack screens (no tab bar) use the same bottom inset so content never
 * sits flush against the device edge.
 */

/** Matches TabBar `h-14` (3.5rem). */
export const TAB_BAR_HEIGHT_CLASS = "3.5rem";

/** Offset for fixed ScreenHeader (safe area + h-14) plus ScreenBody content inset. */
export const SCREEN_BODY_TOP_PADDING =
  "pt-[calc(3.5rem+env(safe-area-inset-top)+1rem)]";

/** Bottom inset for stack/detail screens without the tab bar visible. */
export const STACK_SCREEN_BOTTOM_PADDING =
  "pb-[calc(3.5rem+env(safe-area-inset-bottom))]";

/** Bottom inset for tab-root screens (tab bar + breathing room). */
export const TAB_SCREEN_BOTTOM_PADDING =
  "pb-[calc(4.5rem+env(safe-area-inset-bottom))]";

/** Bottom inset when a sticky footer action bar is present. */
export const STICKY_FOOTER_BOTTOM_PADDING =
  "pb-[calc(5.5rem+env(safe-area-inset-bottom))]";

export function getScreenBodyScrollPadding(options: {
  withTabBar: boolean;
  withStickyFooter: boolean;
}): string {
  if (options.withStickyFooter) return STICKY_FOOTER_BOTTOM_PADDING;
  if (options.withTabBar) return TAB_SCREEN_BOTTOM_PADDING;
  return STACK_SCREEN_BOTTOM_PADDING;
}
