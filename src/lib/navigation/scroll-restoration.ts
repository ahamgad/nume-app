/** In-memory scroll positions keyed by route (pathname + search). */

const scrollPositions = new Map<string, number>();

export function buildScrollRestorationKey(
  pathname: string,
  search = "",
): string {
  return search ? `${pathname}${search}` : pathname;
}

export function getScrollPosition(key: string): number | undefined {
  return scrollPositions.get(key);
}

export function setScrollPosition(key: string, scrollTop: number) {
  if (scrollTop <= 0) {
    scrollPositions.delete(key);
    return;
  }
  scrollPositions.set(key, scrollTop);
}

export function clearScrollPosition(key: string) {
  scrollPositions.delete(key);
}
