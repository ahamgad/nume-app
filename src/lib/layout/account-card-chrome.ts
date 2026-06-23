import { cn } from "@/lib/utils";

/** Category label → first account card (px). */
export const ACCOUNT_CARD_CATEGORY_TO_FIRST_GAP_PX = 16;

/** Account card → next account card within a category (px). */
export const ACCOUNT_CARD_GAP_PX = 16;

/** Last card in category → next category label (px). */
export const ACCOUNT_CARD_CATEGORY_GAP_PX = 24;

/** Internal padding on every account card (px). */
export const ACCOUNT_CARD_PADDING_PX = 16;

/** Institution logo size on account cards (px). */
export const ACCOUNT_CARD_LOGO_SIZE_PX = 45;

/** Logo → text block gap (px). */
export const ACCOUNT_CARD_LOGO_TEXT_GAP_PX = 8;

/** Top section → divider, divider → balance section (px). */
export const ACCOUNT_CARD_SECTION_DIVIDER_GAP_PX = 16;

/** Shared subtle elevation — account cards foundation only. */
export const ACCOUNT_CARD_SHADOW_CLASS =
  "shadow-[0_1px_3px_rgba(0,0,0,0.07)]";

export const ACCOUNT_CARD_CATEGORY_LABEL_CLASS =
  "text-[0.8125rem] font-medium text-muted-foreground";

export const ACCOUNT_CARD_CONTAINER_CLASS = cn(
  "block w-full rounded-lg border border-border bg-card text-start transition-colors active:bg-muted",
  ACCOUNT_CARD_SHADOW_CLASS,
);

export const ACCOUNT_CARD_PADDING_CLASS = "p-4";

export const ACCOUNT_CARD_INSTITUTE_ROW_CLASS =
  "min-w-0 flex-1 truncate text-[0.8125rem] font-normal leading-snug text-muted-foreground tabular-nums";

export const ACCOUNT_CARD_NAME_CLASS =
  "min-w-0 truncate text-[0.9375rem] font-medium leading-snug";

export const ACCOUNT_CARD_BALANCE_LABEL_CLASS =
  "text-[0.8125rem] font-medium leading-snug text-muted-foreground";

/** Balance amount on account cards — 18px semibold (numeric typography foundation). */
export const ACCOUNT_CARD_BALANCE_VALUE_FONT_SIZE_PX = 18;

export const ACCOUNT_CARD_BALANCE_VALUE_CLASS =
  "text-[1.125rem] font-semibold";
