import { cn } from "@/lib/utils";

import { CARD_CHEVRON_ROW_CLASS } from "@/lib/layout/account-card-chrome";

/** Label → control gap inside a field (px). */
export const INPUT_FIELD_LABEL_TO_CONTROL_GAP_PX = 8;

/** Field content → section divider, divider → next field (px). */
export const INPUT_FIELD_DIVIDER_GAP_PX = 16;

/** Control → error text gap (px). */
export const INPUT_FIELD_ERROR_GAP_PX = 4;

/** Fixed currency decoration for amount fields (not a placeholder). */
export const INPUT_FIELD_AMOUNT_PREFIX = "EGP";

/** Fixed rate decoration for rate fields (not a placeholder). */
export const INPUT_FIELD_RATE_SUFFIX = "%";

/** Field label — 13px regular. */
export const INPUT_FIELD_LABEL_CLASS =
  "text-[0.8125rem] font-normal leading-none text-foreground";

/** Required indicator — same typography and color as label. */
export const INPUT_FIELD_REQUIRED_INDICATOR_CLASS = INPUT_FIELD_LABEL_CLASS;

/** Label + control stack — 8px gap. */
export const INPUT_FIELD_STACK_CLASS = "flex flex-col gap-2";

/** Inline value / input text — 15px regular. */
export const INPUT_FIELD_VALUE_CLASS =
  "min-w-0 flex-1 truncate text-[0.9375rem] font-normal leading-snug";

export const INPUT_FIELD_PLACEHOLDER_CLASS = "text-muted-foreground";

/** Amount / rate affix — same typography and color as placeholder. */
export const INPUT_FIELD_AFFIX_CLASS =
  "shrink-0 text-[0.9375rem] font-normal text-muted-foreground";

/** Chevron row trigger — 0 padding, shared card chevron spacing. */
export const INPUT_FIELD_ROW_TRIGGER_CLASS = cn(
  "flex w-full items-center p-0 text-start transition-colors",
  "disabled:cursor-not-allowed disabled:opacity-50",
  CARD_CHEVRON_ROW_CLASS,
);

/** In-flow field hint below control. */
export const INPUT_FIELD_HINT_CLASS =
  "text-[0.8125rem] text-muted-foreground";

/** Error text — 4px below control, in normal document flow. */
export const INPUT_FIELD_ERROR_CLASS = "text-[0.8125rem] text-destructive";

export const INPUT_FIELD_ERROR_OFFSET_CLASS = "mt-1";
