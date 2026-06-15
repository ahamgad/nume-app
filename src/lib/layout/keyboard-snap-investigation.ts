/**
 * Keyboard snap isolation — enable ONE experiment at a time, then re-test:
 * Add Certificate → focus Certificate name.
 *
 * Experiment A: fixed viewport height instead of dynamic (h-dvh).
 * Experiment B: disable document scroll guard.
 *
 * Do not enable both simultaneously.
 */

export const KEYBOARD_SNAP_EXPERIMENT_A_FIXED_APP_HEIGHT = true;

export const KEYBOARD_SNAP_EXPERIMENT_B_DISABLE_SCROLL_GUARD = false;

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
