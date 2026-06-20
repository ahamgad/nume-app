import { isTabRootPath } from "@/lib/navigation/tab-roots";

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

/** Whether iOS edge swipe should be blocked for the current navigation context. */
export function shouldBlockNavigationEdgeSwipe(
  pathname: string,
  isNavigationDirty: boolean,
): boolean {
  return (
    isTabRootPath(pathname) ||
    isNavigationDirty ||
    isSwipeBackDisabledStackPath(pathname)
  );
}
