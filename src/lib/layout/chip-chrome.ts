import { CARD_SURFACE_BG_CLASS } from "@/lib/layout/card-surface";
import { cn } from "@/lib/utils";

/** Chips on app canvas, sheet background, or any non-card surface. */
export type ChipCanvasSurface = "canvas";

/** Chips inside a card surface container. */
export type ChipCardSurface = "card";

export type ChipSurface = ChipCanvasSurface | ChipCardSurface;

const CHIP_BASE_CLASS =
  "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-colors";

export const CHIP_DISABLED_CLASS = "cursor-not-allowed opacity-45";

export function chipButtonClassName(
  surface: ChipSurface,
  selected: boolean,
  disabled = false,
): string {
  const activeClass =
    surface === "card" ? "bg-background" : CARD_SURFACE_BG_CLASS;
  const inactiveClass =
    surface === "card" ? CARD_SURFACE_BG_CLASS : "bg-background";

  return cn(
    CHIP_BASE_CLASS,
    selected
      ? cn("border-foreground/25 text-foreground", activeClass)
      : cn("border-border text-foreground", inactiveClass),
    disabled && CHIP_DISABLED_CLASS,
  );
}
