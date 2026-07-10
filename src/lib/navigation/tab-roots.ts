/** Authenticated app home — post-splash and dashboard tab destination. */
export const DASHBOARD_PATH = "/dashboard" as const;

/** Tab bar destinations — navigation roots; peers, not linear history. */
export const TAB_ROOT_PATHS = [
  DASHBOARD_PATH,
  "/planning",
  "/accounts",
  "/goals",
  "/more",
] as const;

export type TabRootPath = (typeof TAB_ROOT_PATHS)[number];

export function isTabRootPath(pathname: string): boolean {
  return TAB_ROOT_PATHS.some((href) => href === pathname);
}
