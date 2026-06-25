import { BALANCE_DISPLAY_CLASS } from "@/lib/finance/balance-display";

/** Record description — same size as amount; foreground matches amount color. */
export const RECORD_ROW_LABEL_CLASS = `truncate min-w-0 flex-1 text-[0.9375rem] leading-snug ${BALANCE_DISPLAY_CLASS}`;

/** Record amount — same size as description, medium weight. */
export const RECORD_ROW_AMOUNT_CLASS = "text-[0.9375rem] font-medium";

/** Second-row account / transfer label — left column. */
export const RECORD_ROW_SUBLINE_CLASS =
  "min-w-0 flex-1 truncate text-[0.8125rem] leading-snug text-muted-foreground tabular-nums";

/** Second-row date — right column. */
export const RECORD_ROW_DATE_CLASS =
  "shrink-0 text-[0.8125rem] leading-snug text-muted-foreground tabular-nums";
