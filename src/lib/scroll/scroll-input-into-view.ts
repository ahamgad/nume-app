/** Header bar (h-14) + safe-area clearance for scroll positioning. */
export const HEADER_CLEARANCE_PX = 56;
/** Gap between header zone and focused field top. */
export const FOCUS_TOP_GAP_PX = 20;
/** Breathing room below focused field before keyboard. */
export const FOCUS_CONTEXT_BELOW_PX = 40;

interface ScrollInputOptions {
  headerClearance?: number;
  topGap?: number;
  contextBelow?: number;
}

function getKeyboardTop(): number {
  const viewport = window.visualViewport;
  if (!viewport) return window.innerHeight;
  return viewport.offsetTop + viewport.height;
}

function getVisibleRegion(
  container: HTMLElement,
  options?: ScrollInputOptions,
) {
  const headerClearance = options?.headerClearance ?? HEADER_CLEARANCE_PX;
  const topGap = options?.topGap ?? FOCUS_TOP_GAP_PX;
  const contextBelow = options?.contextBelow ?? FOCUS_CONTEXT_BELOW_PX;
  const containerRect = container.getBoundingClientRect();
  const keyboardTop = getKeyboardTop();

  return {
    idealInputTop: Math.max(containerRect.top, 0) + headerClearance + topGap,
    visibleBottom: Math.min(containerRect.bottom, keyboardTop) - contextBelow,
  };
}

export function getKeyboardOverlapPx(): number {
  const viewport = window.visualViewport;
  if (!viewport) return 0;
  return Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop);
}

/**
 * Scroll within container so the focused field sits below the header with
 * context visible beneath it — never uses scrollIntoView.
 */
export function scrollInputIntoContainer(
  container: HTMLElement,
  target: HTMLElement,
  options?: ScrollInputOptions,
): void {
  const targetRect = target.getBoundingClientRect();
  const { idealInputTop, visibleBottom } = getVisibleRegion(container, options);

  let delta = 0;

  if (targetRect.top > idealInputTop + 4) {
    delta = targetRect.top - idealInputTop;
  } else if (targetRect.top < idealInputTop - 4) {
    delta = targetRect.top - idealInputTop;
  }

  if (targetRect.bottom > visibleBottom) {
    delta = Math.max(delta, targetRect.bottom - visibleBottom);
  }

  if (delta !== 0) {
    container.scrollTop += delta;
  }
}

export function readContainerPaddingBottom(container: HTMLElement): number {
  return Number.parseFloat(getComputedStyle(container).paddingBottom) || 0;
}

export function applyKeyboardScrollInset(container: HTMLElement): number {
  const overlap = getKeyboardOverlapPx();
  if (overlap <= 0) {
    if (container.dataset.keyboardOpen) {
      clearKeyboardScrollInset(container);
    }
    return 0;
  }

  if (!container.dataset.basePaddingBottom) {
    container.dataset.basePaddingBottom = String(
      readContainerPaddingBottom(container),
    );
  }

  const base = Number.parseFloat(container.dataset.basePaddingBottom) || 0;
  container.dataset.keyboardOpen = "true";
  container.style.paddingBottom = `${base + overlap}px`;
  return overlap;
}

export function clearKeyboardScrollInset(container: HTMLElement) {
  delete container.dataset.keyboardOpen;
  delete container.dataset.basePaddingBottom;
  container.style.removeProperty("padding-bottom");
}
