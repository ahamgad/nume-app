import { cn } from "@/lib/utils";
import { isTabRootPath } from "@/lib/navigation/tab-roots";

/**
 * Splash-aligned deceleration curve — smooth arrival with no overshoot.
 * @see globals.css `.nume-splash-n-stroke-path`
 */
export const NUME_MOTION_EASE = "cubic-bezier(0.45, 0.05, 0.2, 1)" as const;

export const NUME_MOTION_EASE_CLASS = `ease-[${NUME_MOTION_EASE}]`;

export const NUME_MOTION_DURATION_MS = 200 as const;

export const NUME_MOTION_DURATION_CLASS = "duration-200";

/** Backdrop / overlay enter — fade only. */
export const NUME_OVERLAY_ENTER_CLASS = cn(
  "animate-in fade-in-0",
  NUME_MOTION_DURATION_CLASS,
  NUME_MOTION_EASE_CLASS,
);

/** Fixed modal backdrop enter — sheets and dialogs. */
export const NUME_MODAL_OVERLAY_ENTER_CLASS = cn(
  "fixed inset-0 z-50",
  NUME_OVERLAY_ENTER_CLASS,
);

/** Bottom sheet panel enter — vertical slide + fade. */
export const NUME_BOTTOM_SHEET_ENTER_CLASS = cn(
  "animate-in fade-in-0 slide-in-from-bottom-4",
  NUME_MOTION_DURATION_CLASS,
  NUME_MOTION_EASE_CLASS,
);

/** Full-width stack screen slide direction (LTR forward from end). */
export function numeScreenEnterSlideClass(fromStart: boolean) {
  return fromStart ? "slide-in-from-left-full" : "slide-in-from-right-full";
}

/** Stack / tab screen enter — full slide + fade. */
export function numeScreenEnterClass(fromStart: boolean) {
  return cn(
    "animate-in fade-in-0",
    NUME_MOTION_DURATION_CLASS,
    NUME_MOTION_EASE_CLASS,
    numeScreenEnterSlideClass(fromStart),
  );
}

export type StackNavigationDirection = "forward" | "back";

/**
 * LinkedIn-style navigation logic: tab roots switch instantly; stack routes
 * animate forward from the trailing edge and back from the leading edge.
 */
export function shouldUseStackScreenTransition(
  fromPathname: string,
  toPathname: string,
  direction: StackNavigationDirection,
): boolean {
  if (fromPathname === toPathname) return false;

  // Tab bar peers — no horizontal slide.
  if (
    isTabRootPath(fromPathname) &&
    isTabRootPath(toPathname)
  ) {
    return false;
  }

  // Tab bar jump to a root from a stack screen — instant cut.
  if (isTabRootPath(toPathname) && direction === "forward") {
    return false;
  }

  return true;
}

/** ScreenTransition wrapper — respects prefers-reduced-motion. */
export function numeMotionSafeScreenEnterClass(fromStart: boolean) {
  return cn(
    "motion-safe:animate-in motion-safe:fade-in-0",
    "motion-safe:duration-200",
    `motion-safe:ease-[${NUME_MOTION_EASE}]`,
    fromStart
      ? "motion-safe:slide-in-from-left-full"
      : "motion-safe:slide-in-from-right-full",
  );
}
