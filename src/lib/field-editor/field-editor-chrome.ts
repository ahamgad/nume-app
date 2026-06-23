import { cn } from "@/lib/utils";

/** Gap between field editor content and sign chips (px). */
export const FIELD_EDITOR_SIGN_CHIP_GAP_PX = 24;

/** Gap between sign chips and keyboard (px). */
export const FIELD_EDITOR_KEYBOARD_CHIP_GAP_PX = 24;

/** Maximum editor content size — 22px. Smaller inline trigger sizes are not upscaled. */
export const FIELD_EDITOR_MAX_FONT_SIZE_CLASS = "text-[1.375rem]";

/** Unified placeholder color for all inline-field editors. */
export const FIELD_EDITOR_PLACEHOLDER_CLASS = "placeholder:text-muted-foreground";

/** Borderless centered editor surface — regular weight, max 22px, wraps without clipping. */
export const FIELD_EDITOR_SURFACE_INPUT_CLASS = cn(
  "min-w-0 max-w-full w-full resize-none overflow-hidden border-0 bg-transparent p-0 text-center outline-none",
  "font-normal leading-snug whitespace-pre-wrap break-words",
  FIELD_EDITOR_MAX_FONT_SIZE_CLASS,
  FIELD_EDITOR_PLACEHOLDER_CLASS,
);

/** Suffix unit label inside the editor (display layer — not placeholder). */
export const FIELD_EDITOR_SUFFIX_LABEL_CLASS = cn(
  "shrink-0 font-normal tabular-nums text-muted-foreground",
  FIELD_EDITOR_MAX_FONT_SIZE_CLASS,
);
