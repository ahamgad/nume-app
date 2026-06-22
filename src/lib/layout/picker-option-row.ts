import { cn } from "@/lib/utils";

/** Shared picker listbox option row — square corners, no radius. */
export const PICKER_OPTION_ROW_CLASS =
  "flex min-h-11 w-full items-center px-3 py-2 text-start text-[0.9375rem] transition-colors";

export function pickerOptionRowClassName(selected: boolean): string {
  return cn(
    PICKER_OPTION_ROW_CLASS,
    selected ? "bg-muted font-medium" : "hover:bg-muted/60 active:bg-muted",
  );
}
