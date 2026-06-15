/**
 * Layout isolation experiments — enable ONE sizing/guard experiment at a time (A/B).
 * Experiments C–D are independent diagnostics.
 *
 * Re-test: Add Certificate → focus Certificate name.
 */

export const KEYBOARD_SNAP_EXPERIMENT_A_FIXED_APP_HEIGHT = false;

export const KEYBOARD_SNAP_EXPERIMENT_B_DISABLE_SCROLL_GUARD = false;

/** iOS-only gentle pre-keyboard scroll nudge for Safari's upper focus dead zone. */
export const KEYBOARD_SNAP_EXPERIMENT_C_IOS_DEAD_ZONE_NUDGE = false;

/** Diagnostic: fixed ScreenHeader outside flex flow with body top padding. */
export const KEYBOARD_SNAP_EXPERIMENT_D_FIXED_HEADER = true;

export function getAppShellHeightClass(): string {
  if (KEYBOARD_SNAP_EXPERIMENT_A_FIXED_APP_HEIGHT) {
    return "h-screen min-h-0";
  }
  return "h-dvh min-h-0";
}

export function getRootBodyHeightClass(): string {
  if (KEYBOARD_SNAP_EXPERIMENT_A_FIXED_APP_HEIGHT) {
    return "h-screen min-h-screen";
  }
  return "h-dvh";
}
