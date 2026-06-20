import { isTabRootPath } from "@/lib/navigation/tab-roots";

/** Stack screens where theme/settings apply immediately — keep native swipe-back. */
const SWIPE_BACK_EXEMPT_PATHS = ["/more/appearance"] as const;

export function isSwipeBackExemptPath(pathname: string): boolean {
  return SWIPE_BACK_EXEMPT_PATHS.some((path) => pathname === path);
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

/** Whether iOS edge swipe should be blocked for the current navigation context. */
export function shouldBlockNavigationEdgeSwipe(
  pathname: string,
  isNavigationDirty: boolean,
): boolean {
  if (isSwipeBackExemptPath(pathname)) {
    return false;
  }
  return isTabRootPath(pathname) || isNavigationDirty;
}
