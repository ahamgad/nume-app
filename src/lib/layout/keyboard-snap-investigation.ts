/**
 * Keyboard snap isolation — enable ONE sizing/guard experiment at a time (A/B).
 * Experiment C (iOS dead-zone nudge) is independent and can run alongside A/B.
 *
 * Re-test: Add Certificate → focus Certificate name (Position A / Position B).
 */

export const KEYBOARD_SNAP_EXPERIMENT_A_FIXED_APP_HEIGHT = false;

export const KEYBOARD_SNAP_EXPERIMENT_B_DISABLE_SCROLL_GUARD = false;

/** iOS-only gentle pre-keyboard scroll nudge for Safari's upper focus dead zone. */
export const KEYBOARD_SNAP_EXPERIMENT_C_IOS_DEAD_ZONE_NUDGE = true;

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
