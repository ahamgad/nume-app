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

/** Hero title section vertical padding (24px top and bottom). */
export const ACCOUNT_DETAILS_HEADER_REGION_PADDING_CLASS = "py-6";

export function accountDetailsBalanceMetaClassName(className?: string): string {
  return cn(ACCOUNT_DETAILS_BALANCE_META_CLASS, className);
}

export function accountDetailsHeaderRegionClassName(collapsed: boolean): string {
  return cn(
    "-mx-4 -mt-4 px-4 transition-colors",
    ACCOUNT_DETAILS_HEADER_REGION_PADDING_CLASS,
    !collapsed &&
      cn(
        CARD_SURFACE_BG_CLASS,
        ACCOUNT_DETAILS_HEADER_REGION_BOTTOM_RADIUS_CLASS,
      ),
  );
}
