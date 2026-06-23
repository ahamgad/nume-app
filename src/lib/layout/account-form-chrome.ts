import { cn } from "@/lib/utils";

/** Create screen: description → first form section (px). */
export const ACCOUNT_FORM_DESCRIPTION_TO_SECTION_GAP_PX = 16;

/** Between account form sections (px). */
export const ACCOUNT_FORM_SECTION_GAP_PX = 24;

/** Vertical padding inside account form section field stacks (px). */
export const ACCOUNT_FORM_SECTION_FIELDS_PADDING_PX = 16;

/** Field row → divider / divider → next field (px). */
export const ACCOUNT_FORM_FIELD_DIVIDER_GAP_PX = 16;

export const ACCOUNT_FORM_SECTION_STACK_CLASS = "flex flex-col gap-6";

/** Lead description on account create screens. */
export const ACCOUNT_FORM_DESCRIPTION_CLASS =
  "text-[0.9375rem] leading-relaxed text-muted-foreground";

/** Section title — 18px medium. */
export const ACCOUNT_FORM_SECTION_TITLE_CLASS = "text-lg font-medium";

export const ACCOUNT_FORM_SECTION_HEADER_CLASS =
  "border-b border-border px-4 pb-3 pt-4";

export const ACCOUNT_FORM_SECTION_FIELDS_CLASS = "divide-y divide-border py-4";

/** Horizontal inset + 16px vertical rhythm to section dividers. */
export const ACCOUNT_FORM_FIELD_ROW_CLASS = "px-4 py-4";

export const ACCOUNT_FORM_DISABLED_CLASS =
  "pointer-events-none opacity-60";

export function accountFormDisabledClassName(disabled: boolean): string {
  return cn(disabled && ACCOUNT_FORM_DISABLED_CLASS);
}
