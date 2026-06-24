/**
 * Shared screen layout spacing (NUME v1).
 *
 * Scroll containers reserve the tab bar height so content never sits under the
 * fixed tab bar. Stack screens use the same inset when the tab bar is hidden.
 */

/** Matches TabBar `h-14` (3.5rem). */
export const TAB_BAR_HEIGHT_CLASS = "3.5rem";

/** Tab-root scroll padding — tab bar height + safe area. */
export const TAB_BAR_SCROLL_PADDING =
  "pb-[calc(3.5rem+env(safe-area-inset-bottom))]";

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

/** Stack header horizontal padding (16px). */
export const SCREEN_HEADER_HORIZONTAL_PADDING_CLASS = "px-4";

/** Space between header bar items (16px). */
export const SCREEN_HEADER_ITEM_GAP_CLASS = "gap-4";

/** Shared header icon touch target (40×40). */
export const SCREEN_HEADER_ICON_BUTTON_SIZE_CLASS = "size-10";

/** Page header inner bar height (`h-14` / 56px at 16px root). */
export const SCREEN_HEADER_BAR_HEIGHT_CLASS = "3.5rem";

/** Page header inner bar — fixed 56px height, content vertically centered. */
export const SCREEN_HEADER_BAR_CLASS =
  `flex h-14 items-center ${SCREEN_HEADER_HORIZONTAL_PADDING_CLASS} ${SCREEN_HEADER_ITEM_GAP_CLASS}`;

/** Trailing header action slot — icon buttons and text actions. */
export const SCREEN_HEADER_TRAILING_SLOT_CLASS =
  "flex shrink-0 items-center justify-end";

/** Trailing text action in headers (e.g. Save). */
export const SCREEN_HEADER_TEXT_ACTION_CLASS =
  "inline-flex h-11 min-w-11 shrink-0 items-center justify-center rounded-md px-2 text-sm font-semibold text-foreground disabled:opacity-40";

/**
 * Compact navigation title — 16px / 20px regardless of heading element defaults.
 * Includes explicit line-height so h1/h2/span/p render identically.
 */
export const SCREEN_HEADER_TITLE_CLASS =
  "block min-w-0 flex-1 truncate text-base font-semibold leading-tight";

/** Large in-content page title → next content block (px). */
export const SCREEN_PAGE_TITLE_TO_CONTENT_GAP_PX = 24;

/** Margin below `ScreenPageTitle` / `RootPageTitle` / `StackPageTitle`. */
export const SCREEN_PAGE_TITLE_TO_CONTENT_GAP_CLASS = "mb-6";

/**
 * Page header content zone below safe area: inner bar + bottom border (1px).
 * Matches rendered page header height on desktop (57px at 16px root).
 */
export const SCREEN_HEADER_CONTENT_ZONE_HEIGHT_CLASS = "calc(3.5rem + 1px)";

/** Top padding for page-aligned surfaces (not bottom sheets). */
export const SCREEN_HEADER_CONTENT_ZONE_TOP_PADDING_CLASS =
  "pt-[calc(3.5rem+1px)]";

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
 * Diagnostic: compensates for fixed ScreenHeader (inner bar + safe area + ScreenBody pt-4).
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
