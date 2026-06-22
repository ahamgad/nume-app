import { cn } from "@/lib/utils";

/** Vertical spacing between a picker row and an adjacent divider (2px). */
export const PICKER_LIST_DIVIDER_GAP_CLASS = "py-0.5";

/** Picker list divider line. */
export const PICKER_LIST_DIVIDER_LINE_CLASS = "h-px bg-border";

/** Shared picker listbox option row — square corners (radius 0). */
export const PICKER_OPTION_ROW_CLASS =
  "flex min-h-11 w-full items-center rounded-none px-3 py-2 text-start text-[0.9375rem] transition-colors";

export function pickerOptionRowClassName(selected: boolean): string {
  return cn(
    PICKER_OPTION_ROW_CLASS,
    selected ? "bg-muted font-medium" : "hover:bg-muted/60 active:bg-muted",
  );
}
