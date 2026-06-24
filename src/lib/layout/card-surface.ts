import { cn } from "@/lib/utils";

/** Shared card border radius — 16px. */
export const CARD_SURFACE_BORDER_RADIUS_CLASS = "rounded-2xl";

/** Shared card border — account cards, type picker cards, dashboard widgets, form sections. */
export const CARD_SURFACE_BORDER_CLASS = "border border-border";

export const CARD_SURFACE_BG_CLASS = "bg-card";

/** Full card surface (border, radius, background). Shadows are not used. */
export const CARD_SURFACE_CLASS = cn(
  CARD_SURFACE_BORDER_RADIUS_CLASS,
  CARD_SURFACE_BORDER_CLASS,
  CARD_SURFACE_BG_CLASS,
);

/** Flat card surface — same tokens as {@link CARD_SURFACE_CLASS}. */
export const CARD_SURFACE_FLAT_CLASS = CARD_SURFACE_CLASS;
