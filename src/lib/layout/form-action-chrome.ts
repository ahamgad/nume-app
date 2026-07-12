/** Primary form action — account create/edit screens and matching confirmation sheets. */
export const FORM_PRIMARY_ACTION_BUTTON_CLASS = "h-12 w-full text-base";

/** Foundation text button — label only, no background, border, or surface fill. */
export const TEXT_BUTTON_CLASS =
  "inline-flex h-auto min-h-0 w-full items-center justify-center border-0 bg-transparent px-0 py-0 text-sm font-semibold text-foreground transition-opacity hover:bg-transparent disabled:pointer-events-none disabled:opacity-50";

/** Confirmation sheet primary and secondary actions — same height as form CTAs. */
export const CONFIRMATION_SHEET_ACTION_BUTTON_CLASS =
  FORM_PRIMARY_ACTION_BUTTON_CLASS;
