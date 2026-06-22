/**
 * Date picker bottom sheet sizing (NUME v1).
 *
 * Fixed height for the tallest stable calendar state:
 * header + month nav + weekday row + 6 grid rows + bottom padding + safe area.
 *
 * Values mirror `NumeCalendarGrid` layout tokens (`h-14`, `size-11`, `gap-1`, etc.).
 */

import { BOTTOM_SHEET_HEADER_BAR_HEIGHT_CLASS } from "@/lib/layout/bottom-sheet";

/** Immersive sheet header bar — matches {@link BOTTOM_SHEET_HEADER_BAR_HEIGHT_CLASS}. */
const SHEET_HEADER = BOTTOM_SHEET_HEADER_BAR_HEIGHT_CLASS;

/** Body top padding (`pt-4`). */
const BODY_TOP = "1rem";

/** Month navigation row (`size-11` / title row). */
const MONTH_NAV_ROW = "2.75rem";

/** Space below month navigation (`mb-6`). */
const MONTH_NAV_GAP = "1.5rem";

/** Weekday label row (`h-10`). */
const WEEKDAY_ROW = "2.5rem";

/** Space below weekday row (`mb-3`). */
const WEEKDAY_GAP = "0.75rem";

/** Six day rows at `size-11` with `gap-1` between rows. */
const CALENDAR_GRID =
  "calc(2.75rem * 6 + 0.25rem * 5)";

/** Body bottom padding before safe area (`pb-6` / `1.5rem`). */
const BODY_BOTTOM = "1.5rem";

export const DATE_PICKER_SHEET_HEIGHT = [
  "calc(",
  [
    SHEET_HEADER,
    BODY_TOP,
    MONTH_NAV_ROW,
    MONTH_NAV_GAP,
    WEEKDAY_ROW,
    WEEKDAY_GAP,
    CALENDAR_GRID,
    BODY_BOTTOM,
    "env(safe-area-inset-bottom)",
  ].join(" + "),
  ")",
].join("");

/** Calendar grid always renders six week rows for stable sheet height. */
export const CALENDAR_WEEK_ROWS = 6;
