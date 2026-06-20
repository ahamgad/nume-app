import { isTabRootPath } from "@/lib/navigation/tab-roots";

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
  return isTabRootPath(pathname) || isNavigationDirty;
}
