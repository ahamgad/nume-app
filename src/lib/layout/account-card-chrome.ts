import { cn } from "@/lib/utils";
import { CARD_SURFACE_CLASS } from "@/lib/layout/card-surface";

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

export const ACCOUNT_CARD_CATEGORY_LABEL_CLASS =
  "text-[0.8125rem] font-medium text-muted-foreground";

export const ACCOUNT_CARD_CONTAINER_CLASS = cn(
  "block w-full text-start transition-colors active:bg-muted",
  CARD_SURFACE_CLASS,
);

export const ACCOUNT_CARD_PADDING_CLASS = "p-4";

/** Top metadata row (account type · last-4) — 13px regular. */
export const ACCOUNT_CARD_INSTITUTE_ROW_CLASS =
  "min-w-0 flex-1 truncate text-[0.8125rem] font-normal leading-snug text-muted-foreground tabular-nums";

export const ACCOUNT_CARD_NAME_CLASS =
  "min-w-0 truncate text-[0.9375rem] font-medium leading-snug";

/** Trailing chevron on account cards — source of truth for card-based selection surfaces. */
export const CARD_CHEVRON_CLASS =
  "size-5 shrink-0 text-muted-foreground rtl:rotate-180";

/** Flex row spacing between label content and trailing chevron (8px). */
export const CARD_CHEVRON_ROW_CLASS = "flex min-w-0 items-center gap-2";
