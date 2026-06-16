/**
 * Whether the fixed bottom tab bar is visible for the current route.
 * Keep in sync with `TabBar` rendering rules.
 */
export function isTabBarVisible(pathname: string): boolean {
  return !isStackScreen(pathname);
}

export function isStackScreen(pathname: string): boolean {
  return (
    pathname.startsWith("/accounts/") ||
    pathname.startsWith("/more/") ||
    pathname.includes("/records/")
  );
}
