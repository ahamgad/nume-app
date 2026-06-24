/**
 * Bottom sheet header building blocks (frozen).
 * All bottom sheets compose through Foundation wrappers + these exports.
 * @see docs/FOUNDATION.md § 9
 */

import type { ComponentProps, ReactNode } from "react";

import {
  SCREEN_HEADER_TEXT_ACTION_CLASS,
  SCREEN_HEADER_TITLE_CLASS,
  SCREEN_HEADER_TRAILING_SLOT_CLASS,
} from "@/components/layout/screen-header";
import {
  BOTTOM_SHEET_HEADER_BAR_CLASS,
  BOTTOM_SHEET_HEADERLESS_TOP_PADDING_CLASS,
  BOTTOM_SHEET_TOP_RADIUS_CLASS,
  BOTTOM_SHEET_TOP_RADIUS_PX,
} from "@/lib/layout/bottom-sheet";
import { cn } from "@/lib/utils";
import { SurfaceStateProvider } from "@/providers/surface-state-provider";

export {
  BOTTOM_SHEET_HEADER_BAR_CLASS,
  BOTTOM_SHEET_HEADERLESS_TOP_PADDING_CLASS,
  BOTTOM_SHEET_TOP_RADIUS_CLASS,
  BOTTOM_SHEET_TOP_RADIUS_PX,
} from "@/lib/layout/bottom-sheet";

/** Shared backdrop for all bottom sheets — stronger modal separation. */
export const BOTTOM_SHEET_BACKDROP_CLASS = "bg-black/55";

/** Bottom-anchored panel base shared by all bottom sheet variants. */
const BOTTOM_SHEET_PANEL_BASE = cn(
  "absolute inset-x-0 bottom-0 mx-auto flex w-full max-w-lg flex-col overflow-hidden bg-background shadow-sm",
  BOTTOM_SHEET_TOP_RADIUS_CLASS,
);

/** Shared bottom sheet panel chrome — borderless, native-style surface. */
export const BOTTOM_SHEET_PANEL_CLASS = BOTTOM_SHEET_PANEL_BASE;

/**
 * Bottom sheet panel with canvas surface context — back/close icons on sheet
 * background use card-surface accent chrome regardless of parent card context.
 */
export function BottomSheetPanel({
  className,
  children,
  ...props
}: ComponentProps<"div">) {
  return (
    <SurfaceStateProvider value="canvas">
      <div className={cn(BOTTOM_SHEET_PANEL_CLASS, className)} {...props}>
        {children}
      </div>
    </SurfaceStateProvider>
  );
}

/** @deprecated Use BOTTOM_SHEET_PANEL_CLASS — kept for import compatibility. */
export const CONFIRMATION_SHEET_PANEL_CLASS = BOTTOM_SHEET_PANEL_BASE;

/** @deprecated Use {@link SCREEN_HEADER_TEXT_ACTION_CLASS}. */
export const BOTTOM_SHEET_HEADER_TEXT_ACTION_CLASS =
  SCREEN_HEADER_TEXT_ACTION_CLASS;

/** Opening animation aligned across sheet types. */
export { NUME_BOTTOM_SHEET_ENTER_CLASS as BOTTOM_SHEET_ENTER_CLASS } from "@/lib/layout/motion";

interface BottomSheetHeaderProps {
  title: string;
  titleId?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  className?: string;
}

/**
 * Shared sheet header — same padding, gaps, icon sizing, and title styling as
 * stack/tab page headers (`ScreenHeader`).
 */
export function BottomSheetHeader({
  title,
  titleId,
  leading,
  trailing,
  className,
}: BottomSheetHeaderProps) {
  return (
    <SurfaceStateProvider value="canvas">
      <header className={cn("shrink-0 bg-background", className)}>
        <div className={BOTTOM_SHEET_HEADER_BAR_CLASS}>
          {leading}
          <span id={titleId} className={SCREEN_HEADER_TITLE_CLASS}>
            {title}
          </span>
          {trailing ? (
            <div className={SCREEN_HEADER_TRAILING_SLOT_CLASS}>{trailing}</div>
          ) : null}
        </div>
      </header>
    </SurfaceStateProvider>
  );
}

/** Content wrapper for headerless sheets (e.g. confirmations). */
export function BottomSheetHeaderlessContent({
  className,
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "px-4",
        BOTTOM_SHEET_HEADERLESS_TOP_PADDING_CLASS,
        "pb-[calc(1rem+env(safe-area-inset-bottom))]",
        className,
      )}
      {...props}
    />
  );
}

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
