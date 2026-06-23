import { cn } from "@/lib/utils";

/** Vertical spacing between a picker row and an adjacent divider (2px). */
export const PICKER_LIST_DIVIDER_GAP_CLASS = "py-0.5";

/** Picker list divider line. */
export const PICKER_LIST_DIVIDER_LINE_CLASS = "h-px bg-border";

/** Shared picker listbox option row — square corners (radius 0). */
export const PICKER_OPTION_ROW_CLASS =
  "flex min-h-11 w-full items-center rounded-none px-3 py-2 text-start text-[0.9375rem] transition-colors";

/** Two-line picker row layout — Institution Picker is the visual source of truth. */
export const PICKER_ROW_OPTION_LAYOUT_CLASS = "min-h-11 gap-3";

/** Primary label column on institution/account picker rows. */
export const PICKER_ROW_TEXT_COLUMN_CLASS =
  "flex min-w-0 flex-1 flex-col justify-center";

/** Primary label on two-line picker rows (institution shortcut, account name). */
export const PICKER_ROW_PRIMARY_LABEL_CLASS = "text-[0.9375rem] font-medium";

/** Secondary metadata on two-line picker rows (institution full name, account type · last-4). */
export const PICKER_ROW_SECONDARY_LABEL_CLASS = "text-sm text-muted-foreground";

export function pickerOptionRowClassName(selected: boolean): string {
  return cn(
    PICKER_OPTION_ROW_CLASS,
    selected ? "bg-muted font-medium" : "hover:bg-muted/60 active:bg-muted",
  );
}
