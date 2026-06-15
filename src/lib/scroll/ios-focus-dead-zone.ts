import { isIosDevice } from "@/lib/device/ios-safari";
import { KEYBOARD_SNAP_EXPERIMENT_C_IOS_DEAD_ZONE_NUDGE } from "@/lib/layout/keyboard-snap-investigation";

import { isInputFullyVisibleInContainer } from "./scroll-input-into-view";

/**
 * Upper band below scroll-container top where iOS Safari focus snap triggers.
 * Add Certificate → Certificate name sits ~180px from ScreenBody top; tune
 * toward 120 for strict spec, or ~200 to cover that field.
 */
export const IOS_FOCUS_DEAD_ZONE_MAX_PX = 200;

/** Gentle scroll offset to leave Safari's native focus dead zone. */
export const IOS_FOCUS_DEAD_ZONE_NUDGE_PX = 32;

export function getInputOffsetFromContainerTop(
  container: HTMLElement,
  target: HTMLElement,
): number {
  const containerRect = container.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();
  return targetRect.top - containerRect.top;
}

export function isInputInIosFocusDeadZone(
  container: HTMLElement,
  target: HTMLElement,
): boolean {
  const offsetTop = getInputOffsetFromContainerTop(container, target);
  return offsetTop >= 0 && offsetTop <= IOS_FOCUS_DEAD_ZONE_MAX_PX;
}

export interface IosFocusDeadZoneNudgeSession {
  startScrollTop: number;
  nudgePx: number;
}

export function shouldApplyIosFocusDeadZoneNudge(
  container: HTMLElement,
  target: HTMLElement,
): boolean {
  if (!KEYBOARD_SNAP_EXPERIMENT_C_IOS_DEAD_ZONE_NUDGE) return false;
  if (!isIosDevice()) return false;
  if (container.scrollTop !== 0) return false;
  if (!isInputFullyVisibleInContainer(container, target)) return false;
  return isInputInIosFocusDeadZone(container, target);
}

export function applyIosFocusDeadZoneNudge(
  container: HTMLElement,
): IosFocusDeadZoneNudgeSession {
  const startScrollTop = container.scrollTop;
  const nudgePx = IOS_FOCUS_DEAD_ZONE_NUDGE_PX;

  container.scrollTo({
    top: startScrollTop + nudgePx,
    behavior: "smooth",
  });

  return { startScrollTop, nudgePx };
}

export function restoreIosFocusDeadZoneNudge(
  container: HTMLElement,
  session: IosFocusDeadZoneNudgeSession,
) {
  if (container.scrollTop <= session.startScrollTop + session.nudgePx + 2) {
    container.scrollTop = session.startScrollTop;
  }
}
