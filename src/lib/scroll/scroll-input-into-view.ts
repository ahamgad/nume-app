const HEADER_CLEARANCE_PX = 64;
const DEFAULT_BOTTOM_RESERVE_PX = 16;

interface ScrollInputOptions {
  bottomReserve?: number;
  headerClearance?: number;
}

function getVisibleBounds(
  container: HTMLElement,
  options?: ScrollInputOptions,
) {
  const bottomReserve = options?.bottomReserve ?? DEFAULT_BOTTOM_RESERVE_PX;
  const headerClearance = options?.headerClearance ?? HEADER_CLEARANCE_PX;
  const containerRect = container.getBoundingClientRect();
  const viewportHeight = window.visualViewport?.height ?? window.innerHeight;

  return {
    top: Math.max(containerRect.top + headerClearance, headerClearance),
    bottom: Math.min(
      containerRect.bottom - bottomReserve,
      viewportHeight - bottomReserve,
    ),
  };
}

export function isInputVisibleInContainer(
  container: HTMLElement,
  target: HTMLElement,
  options?: ScrollInputOptions,
): boolean {
  const targetRect = target.getBoundingClientRect();
  const { top, bottom } = getVisibleBounds(container, options);
  return targetRect.top >= top && targetRect.bottom <= bottom;
}

/**
 * Scroll only within the given container — never calls scrollIntoView,
 * so document/window scroll is not affected.
 */
export function scrollInputIntoContainer(
  container: HTMLElement,
  target: HTMLElement,
  options?: ScrollInputOptions,
): void {
  const targetRect = target.getBoundingClientRect();
  const { top, bottom } = getVisibleBounds(container, options);

  let delta = 0;
  if (targetRect.bottom > bottom) {
    delta = targetRect.bottom - bottom;
  } else if (targetRect.top < top) {
    delta = targetRect.top - top;
  }

  if (delta !== 0) {
    container.scrollTop += delta;
  }
}
