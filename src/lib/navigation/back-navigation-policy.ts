import { isTabRootPath } from "@/lib/navigation/tab-roots";

/**
 * Product toggle: temporarily disable interactive edge swipe-back globally.
 * Keep navigation guards and programmatic/browser back working normally.
 */
export const IS_SWIPE_BACK_ENABLED = false;

/**
 * Stack screens where interactive swipe-back is disabled.
 * Theme applies immediately — explicit header back only.
 */
const SWIPE_BACK_DISABLED_STACK_PATHS = ["/more/appearance"] as const;

export function isSwipeBackDisabledStackPath(pathname: string): boolean {
  return SWIPE_BACK_DISABLED_STACK_PATHS.some((path) => pathname === path);
}

/** After popstate from a tab root, restore when swipe would land on a different tab. */
export function shouldRestoreTabRootAfterPopState(
  originPathname: string,
  destinationPathname: string,
): boolean {
  return (
    isTabRootPath(originPathname) &&
    isTabRootPath(destinationPathname) &&
    destinationPathname !== originPathname
  );
}

/**
 * After a native back/swipe gesture, resync Next.js when the browser URL already
 * moved but React Router still reflects the previous stack screen.
 */
export function shouldSyncRouterAfterCleanPopState(
  reactPathname: string,
  destinationPathname: string,
): boolean {
  return (
    reactPathname !== destinationPathname &&
    !shouldRestoreTabRootAfterPopState(reactPathname, destinationPathname)
  );
}

/** Whether iOS edge swipe should be blocked for the current navigation context. */
export function shouldBlockNavigationEdgeSwipe(
  pathname: string,
  isNavigationDirty: boolean,
): boolean {
  if (!IS_SWIPE_BACK_ENABLED) return true;
  return (
    isTabRootPath(pathname) ||
    isNavigationDirty ||
    isSwipeBackDisabledStackPath(pathname)
  );
}
