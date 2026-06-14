import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

/** Shared backdrop for all bottom sheets — stronger modal separation. */
export const BOTTOM_SHEET_BACKDROP_CLASS = "bg-black/55";

/** Bottom-anchored panel chrome shared by selection and confirmation sheets. */
export const BOTTOM_SHEET_PANEL_CLASS =
  "absolute inset-x-0 bottom-0 mx-auto flex w-full max-w-lg flex-col overflow-hidden rounded-t-xl border border-border bg-background shadow-sm";

/** Opening animation aligned across sheet types. */
export const BOTTOM_SHEET_ENTER_CLASS =
  "animate-in fade-in-0 slide-in-from-bottom-4 duration-200 ease-out";

export function BottomSheetDragHandle({
  className,
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      aria-hidden
      className={cn("flex shrink-0 flex-col items-center pt-2", className)}
      {...props}
    >
      <div className="h-1 w-10 rounded-full bg-muted-foreground/35" />
    </div>
  );
}
