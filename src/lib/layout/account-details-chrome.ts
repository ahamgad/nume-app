import { BOTTOM_SHEET_BOTTOM_RADIUS_CLASS } from "@/lib/layout/bottom-sheet";
import { CARD_SURFACE_BG_CLASS } from "@/lib/layout/card-surface";
import { cn } from "@/lib/utils";

/** Account detail card sections — 16px padding on all sides. */
export const ACCOUNT_DETAILS_SECTION_PADDING_CLASS = "p-4";

/** Recent Records section — 16px top/sides, 8px bottom. */
export const ACCOUNT_DETAILS_RECORDS_SECTION_PADDING_CLASS = "px-4 pt-4 pb-2";

/** 8px field row rhythm — Recent Records and Settings toggles. */
export const ACCOUNT_DETAILS_COMPACT_FIELD_ROW_CLASS = "py-2 first:pt-0 last:pb-0";

/** Toggle label — matches Savings Daily Interest toggles (13px medium). */
export const ACCOUNT_DETAILS_TOGGLE_LABEL_CLASS =
  "text-[0.8125rem] font-medium leading-none text-foreground";

/** Toggle description — matches Savings Daily Interest toggles. */
export const ACCOUNT_DETAILS_TOGGLE_DESCRIPTION_CLASS =
  "mt-0.5 text-[0.8125rem] leading-relaxed text-muted-foreground";

/** Spacing between balance value and Updated At meta row. */
export const ACCOUNT_DETAILS_BALANCE_META_CLASS =
  "mt-4 text-[0.8125rem] leading-normal text-muted-foreground";

/** Hero header region bottom radius — reuses bottom sheet corner token. */
export const ACCOUNT_DETAILS_HEADER_REGION_BOTTOM_RADIUS_CLASS =
  BOTTOM_SHEET_BOTTOM_RADIUS_CLASS;

/** Hero card visual inset (24px) — paint layer only, not layout padding. */
export const ACCOUNT_DETAILS_HEADER_REGION_VISUAL_INSET_PX = 24;

/** Tailwind classes for absolute paint-layer vertical inset. */
export const ACCOUNT_DETAILS_HEADER_REGION_VISUAL_INSET_CLASS = "-top-6 -bottom-6";

export function accountDetailsBalanceMetaClassName(className?: string): string {
  return cn(ACCOUNT_DETAILS_BALANCE_META_CLASS, className);
}

/** Layout shell for the account details hero — content-sized, no card padding in flow. */
export function accountDetailsHeaderRegionShellClassName(): string {
  return "relative -mx-4 -mt-4 px-4";
}

/** Paint-only card chrome behind hero content — does not affect layout height. */
export function accountDetailsHeaderRegionPaintClassName(): string {
  return cn(
    "pointer-events-none absolute inset-x-0",
    ACCOUNT_DETAILS_HEADER_REGION_VISUAL_INSET_CLASS,
    CARD_SURFACE_BG_CLASS,
    ACCOUNT_DETAILS_HEADER_REGION_BOTTOM_RADIUS_CLASS,
  );
}
