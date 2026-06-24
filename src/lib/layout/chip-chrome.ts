import {
  surfaceStateAccentBackgroundClass,
  surfaceStateInactiveBackgroundClass,
  type SurfaceCanvasState,
  type SurfaceCardState,
  type SurfaceState,
} from "@/lib/layout/surface-state-chrome";
import { cn } from "@/lib/utils";

/** Chips on app canvas, sheet background, or any non-card surface. */
export type ChipCanvasSurface = SurfaceCanvasState;

/** Chips inside a card surface container. */
export type ChipCardSurface = SurfaceCardState;

export type ChipSurface = SurfaceState;

const CHIP_BASE_CLASS =
  "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-colors";

export const CHIP_DISABLED_CLASS = "cursor-not-allowed opacity-45";

export function chipButtonClassName(
  surface: ChipSurface,
  selected: boolean,
  disabled = false,
): string {
  const activeClass = surfaceStateAccentBackgroundClass(surface);
  const inactiveClass = surfaceStateInactiveBackgroundClass(surface);

  return cn(
    CHIP_BASE_CLASS,
    selected
      ? cn("border-foreground/25 text-foreground", activeClass)
      : cn("border-border text-foreground", inactiveClass),
    disabled && CHIP_DISABLED_CLASS,
  );
}
