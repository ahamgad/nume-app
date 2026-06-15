/** Breathing room below focused field before keyboard. */
export const FOCUS_CONTEXT_BELOW_PX = 40;

interface ScrollInputOptions {
  contextBelow?: number;
}

function getKeyboardTop(): number {
  const viewport = window.visualViewport;
  if (!viewport) return window.innerHeight;
  return viewport.offsetTop + viewport.height;
}

function getVisibleBottom(
  container: HTMLElement,
  options?: ScrollInputOptions,
): number {
  const comfortMargin = options?.contextBelow ?? FOCUS_CONTEXT_BELOW_PX;
  const containerRect = container.getBoundingClientRect();
  const keyboardTop = getKeyboardTop();

  return Math.min(containerRect.bottom, keyboardTop) - comfortMargin;
}

/** True when the input is fully within the scroll container's visible clip. */
export function isInputFullyVisibleInContainer(
  container: HTMLElement,
  target: HTMLElement,
): boolean {
  const containerRect = container.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();

  return (
    targetRect.top >= containerRect.top &&
    targetRect.bottom <= containerRect.bottom &&
    targetRect.left >= containerRect.left &&
    targetRect.right <= containerRect.right
  );
}

/** True when the keyboard (or viewport shrink) would cover the focused field. */
export function isInputObscuredByKeyboard(
  container: HTMLElement,
  target: HTMLElement,
  options?: ScrollInputOptions,
): boolean {
  const targetRect = target.getBoundingClientRect();
  return targetRect.bottom > getVisibleBottom(container, options);
}

export function getKeyboardOverlapPx(): number {
  const viewport = window.visualViewport;
  if (!viewport) return 0;
  return Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop);
}

/**
 * Scroll within the container only when the keyboard would obscure the focused
 * field — never uses scrollIntoView and never repositions already-visible fields.
 *
 * Uses instant scroll so each visualViewport frame stays aligned with the
 * keyboard animation (Apple Notes–style). Minimum delta only; no centering.
 */
export function scrollInputIntoContainer(
  container: HTMLElement,
  target: HTMLElement,
  options?: ScrollInputOptions,
): boolean {
  if (!isInputObscuredByKeyboard(container, target, options)) {
    return false;
  }

  const targetRect = target.getBoundingClientRect();
  const visibleBottom = getVisibleBottom(container, options);
  const delta = targetRect.bottom - visibleBottom;

  if (delta > 0) {
    container.scrollTop += delta;
  }

  return delta > 0;
}

/** True when the on-screen keyboard is presenting (visual viewport shrunk). */
export function isKeyboardPresent(): boolean {
  return getKeyboardOverlapPx() > 0;
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
