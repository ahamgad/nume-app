import { CARD_SURFACE_BG_CLASS } from "@/lib/layout/card-surface";

/**
 * Surface context for accent chrome (back/close, secondary buttons, active chips).
 *
 * Rule A — on app / sheet background (`canvas`): accent uses card surface (`bg-card`).
 * Rule B — inside a card surface (`card`): accent uses app background (`bg-background`).
 *
 * @see docs/FOUNDATION.md — Surface-state foundation
 */

/** Element sits on app or sheet background. */
export type SurfaceCanvasState = "canvas";

/** Element sits inside a card surface container. */
export type SurfaceCardState = "card";

export type SurfaceState = SurfaceCanvasState | SurfaceCardState;

/** Accent background on canvas — card surface color. */
export const SURFACE_STATE_ACCENT_ON_CANVAS_CLASS = CARD_SURFACE_BG_CLASS;

/** Accent background inside a card — app background color. */
export const SURFACE_STATE_ACCENT_ON_CARD_CLASS = "bg-background";

export function surfaceStateAccentBackgroundClass(surface: SurfaceState): string {
  return surface === "card"
    ? SURFACE_STATE_ACCENT_ON_CARD_CLASS
    : SURFACE_STATE_ACCENT_ON_CANVAS_CLASS;
}

export function surfaceStateInactiveBackgroundClass(surface: SurfaceState): string {
  return surface === "card"
    ? SURFACE_STATE_ACCENT_ON_CANVAS_CLASS
    : SURFACE_STATE_ACCENT_ON_CARD_CLASS;
}
