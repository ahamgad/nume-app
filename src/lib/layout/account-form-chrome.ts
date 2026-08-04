import { cn } from "@/lib/utils";

/** Create screen: description → first form section (px). */
export const ACCOUNT_FORM_DESCRIPTION_TO_SECTION_GAP_PX = 16;

/** Between account form sections (px). */
export const ACCOUNT_FORM_SECTION_GAP_PX = 24;

/** Section container padding on all sides (px). */
export const ACCOUNT_FORM_SECTION_PADDING_PX = 16;

/** Section title → first field (px). */
export const ACCOUNT_FORM_SECTION_TITLE_TO_FIELDS_GAP_PX = 16;

/** Field row → divider / divider → next field (px). */
export const ACCOUNT_FORM_FIELD_DIVIDER_GAP_PX = 16;

export const ACCOUNT_FORM_SECTION_STACK_CLASS = "flex flex-col gap-6";

/** Lead description on account create screens. */
export const ACCOUNT_FORM_DESCRIPTION_CLASS =
  "text-[0.9375rem] leading-relaxed text-muted-foreground";

/** Section title — 18px medium. */
export const ACCOUNT_FORM_SECTION_TITLE_CLASS = "text-lg font-medium";

/** Single card section — 16px padding on all sides. */
export const ACCOUNT_FORM_SECTION_PADDING_CLASS = "p-4";

/**
 * Titleless action sections — horizontal section inset only.
 * Vertical rhythm is owned by {@link ACCOUNT_FORM_FIELD_ROW_STANDALONE_CLASS}
 * so section padding and row padding do not stack.
 */
export const ACCOUNT_FORM_SECTION_ACTION_PADDING_CLASS = "px-4";

/** 16px between section title and first field row. */
export const ACCOUNT_FORM_SECTION_TITLE_TO_FIELDS_CLASS = "mt-4";

export const ACCOUNT_FORM_SECTION_FIELDS_CLASS = "divide-y divide-border";

/** Field rows inside a section — 16px to dividers; first/last flush to title/section edge. */
export const ACCOUNT_FORM_FIELD_ROW_CLASS =
  "py-4 first:pt-0 last:pb-0";

/**
 * Field rows in titleless action sections — full 16px vertical rhythm both sides.
 * Paired with {@link ACCOUNT_FORM_SECTION_ACTION_PADDING_CLASS} (horizontal only).
 */
export const ACCOUNT_FORM_FIELD_ROW_STANDALONE_CLASS = "py-4";

export const ACCOUNT_FORM_DISABLED_CLASS =
  "pointer-events-none opacity-60";

export function accountFormDisabledClassName(disabled: boolean): string {
  return cn(disabled && ACCOUNT_FORM_DISABLED_CLASS);
}
