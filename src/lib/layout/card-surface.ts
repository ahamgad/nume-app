import { cn } from "@/lib/utils";

/** Shared card border radius — account cards, type picker cards, account form sections, dashboard widgets. */
export const CARD_SURFACE_BORDER_RADIUS_CLASS = "rounded-lg";

/** Shared card border — account cards, type picker cards, dashboard widgets, form sections. */
export const CARD_SURFACE_BORDER_CLASS = "border border-border";

/** Shared card elevation — account cards and account type picker cards. */
export const CARD_SURFACE_SHADOW_CLASS =
  "shadow-[0_1px_3px_rgba(0,0,0,0.07)]";

export const CARD_SURFACE_BG_CLASS = "bg-card";

/** Full elevated card surface (border, radius, background, shadow). */
export const CARD_SURFACE_CLASS = cn(
  CARD_SURFACE_BORDER_RADIUS_CLASS,
  CARD_SURFACE_BORDER_CLASS,
  CARD_SURFACE_BG_CLASS,
  CARD_SURFACE_SHADOW_CLASS,
);

/** Flat card surface without shadow — dashboard widgets, nested form groups. */
export const CARD_SURFACE_FLAT_CLASS = cn(
  CARD_SURFACE_BORDER_RADIUS_CLASS,
  CARD_SURFACE_BORDER_CLASS,
  CARD_SURFACE_BG_CLASS,
);
