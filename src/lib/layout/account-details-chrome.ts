import { BOTTOM_SHEET_TOP_RADIUS_CLASS } from "@/lib/layout/bottom-sheet";
import { CARD_SURFACE_BG_CLASS } from "@/lib/layout/card-surface";
import { PULL_TO_REFRESH_MAX_VISUAL_OFFSET_PX } from "@/lib/layout/pull-to-refresh";
import { cn } from "@/lib/utils";

/** Account detail card sections — 16px padding on all sides. */
export const ACCOUNT_DETAILS_SECTION_PADDING_CLASS = "p-4";

/** Recent Records section — 16px top/sides, 8px bottom. */
export const ACCOUNT_DETAILS_RECORDS_SECTION_PADDING_CLASS = "px-4 pt-4 pb-2";

/** 8px field row rhythm — Recent Records and Settings toggles. */
export const ACCOUNT_DETAILS_COMPACT_FIELD_ROW_CLASS = "py-2 first:pt-0 last:pb-0";

/** Recent Records list wrapper — no extra row padding; dividers handle rhythm. */
export const ACCOUNT_DETAILS_RECORDS_LIST_WRAPPER_CLASS =
  "py-0 first:pt-0 last:pb-0";

/** 8px above and below record dividers in Recent Records. */
export const ACCOUNT_DETAILS_RECORD_SEPARATOR_MARGIN_CLASS = "my-2";

/** 16px between the last recent record and the View all button. */
export const ACCOUNT_DETAILS_VIEW_ALL_BUTTON_MARGIN_TOP_CLASS = "mt-4";

/** Records history — 24px between hero, chips, and list blocks. */
export const ACCOUNT_RECORDS_HISTORY_SECTION_GAP_CLASS = "mb-6";

/** Records history — 8px between record cards. */
export const ACCOUNT_RECORDS_HISTORY_CARD_GAP_CLASS = "gap-2";

/** Toggle label — matches Savings Daily Interest toggles (13px medium). */
export const ACCOUNT_DETAILS_TOGGLE_LABEL_CLASS =
  "text-[0.8125rem] font-medium leading-none text-foreground";

/** Toggle description — matches Savings Daily Interest toggles. */
export const ACCOUNT_DETAILS_TOGGLE_DESCRIPTION_CLASS =
  "mt-0.5 text-[0.8125rem] leading-relaxed text-muted-foreground";

/** Spacing between balance value and Updated At meta row. */
export const ACCOUNT_DETAILS_BALANCE_META_CLASS =
  "mt-4 text-[0.8125rem] leading-normal text-muted-foreground";

/** Hero card visual inset above content (24px) — paint layer only. */
export const ACCOUNT_DETAILS_HEADER_REGION_VISUAL_INSET_PX = 24;

/** Additional in-flow top padding inside the title section (16px). */
export const ACCOUNT_DETAILS_HEADER_REGION_CONTENT_TOP_PADDING_CLASS = "pt-4";

/** In-flow bottom padding inside the title section (16px + 32px overlap). */
export const ACCOUNT_DETAILS_HEADER_REGION_CONTENT_BOTTOM_PADDING_CLASS = "pb-12";

/** Interest-detail label typography — shared with record row titles. */
export const ACCOUNT_DETAILS_DETAIL_LABEL_CLASS =
  "text-[0.9375rem] leading-snug text-muted-foreground";

/** Body surface below hero — overlaps title, app background, sheet top radius. */
export const ACCOUNT_DETAILS_BODY_SURFACE_TOP_PADDING_CLASS = "pt-6";

export const ACCOUNT_DETAILS_BODY_SURFACE_CLASS = cn(
  "relative z-[1] -mx-4 -mt-8 bg-background px-4",
  BOTTOM_SHEET_TOP_RADIUS_CLASS,
  ACCOUNT_DETAILS_BODY_SURFACE_TOP_PADDING_CLASS,
);

/** Account details in-content title — 18px, same weight and color as large title. */
export const ACCOUNT_DETAILS_TITLE_CLASS =
  "text-[1.125rem] font-semibold leading-tight tracking-tight text-foreground";

/**
 * Paint-layer top extension — max PTR offset + visual inset so card chrome
 * reaches the fixed header while the title region moves with content.
 */
export const ACCOUNT_DETAILS_HEADER_REGION_PAINT_TOP_EXTENSION_CLASS = `-top-[calc(${PULL_TO_REFRESH_MAX_VISUAL_OFFSET_PX}px+${ACCOUNT_DETAILS_HEADER_REGION_VISUAL_INSET_PX}px)]`;

export function accountDetailsBalanceMetaClassName(className?: string): string {
  return cn(ACCOUNT_DETAILS_BALANCE_META_CLASS, className);
}

/** Layout shell for the account details hero — content-sized, no card padding in flow. */
export function accountDetailsHeaderRegionShellClassName(): string {
  return cn("relative -mx-4 -mt-4 px-4");
}

/** Paint-only card chrome behind hero content — does not affect layout height. */
export function accountDetailsHeaderRegionPaintClassName(): string {
  return cn(
    "pointer-events-none absolute inset-x-0 bottom-0",
    ACCOUNT_DETAILS_HEADER_REGION_PAINT_TOP_EXTENSION_CLASS,
    CARD_SURFACE_BG_CLASS,
  );
}

export function accountDetailsHeaderRegionContentClassName(): string {
  return cn(
    "relative",
    ACCOUNT_DETAILS_HEADER_REGION_CONTENT_TOP_PADDING_CLASS,
    ACCOUNT_DETAILS_HEADER_REGION_CONTENT_BOTTOM_PADDING_CLASS,
  );
}
