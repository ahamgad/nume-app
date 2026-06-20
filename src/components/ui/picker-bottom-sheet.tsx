"use client";

import { X } from "lucide-react";
import { useRef, type FocusEvent, type ReactNode } from "react";

import { usePickerSheetHeight } from "@/hooks/use-picker-sheet-height";
import { useSearchSheetLock } from "@/hooks/use-search-sheet-lock";
import { useVisualViewportKeyboardInset } from "@/hooks/use-visual-viewport-keyboard-inset";
import {
  SCREEN_HEADER_ACTION_ICON_CLASS,
  SCREEN_HEADER_BAR_CLASS,
  SCREEN_HEADER_TITLE_CLASS,
} from "@/components/layout/screen-header";
import {
  BOTTOM_SHEET_BACKDROP_CLASS,
  BOTTOM_SHEET_ENTER_CLASS,
} from "@/components/ui/bottom-sheet-chrome";
import { NUME_MODAL_OVERLAY_ENTER_CLASS } from "@/lib/layout/motion";
import { Input } from "@/components/ui/input";
import {
  PICKER_SHEET_CONTENT_TOP_PADDING,
  PICKER_SHEET_MAX_HEIGHT,
  PICKER_SHEET_MIN_HEIGHT,
} from "@/lib/layout/picker-sheet";
import { cn } from "@/lib/utils";
import { useT } from "@/providers/i18n-provider";
import { useModalLayerLock } from "@/providers/modal-layer-provider";

export interface PickerBottomSheetSearchConfig {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

export interface PickerBottomSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  titleId?: string;
  /** When provided, search is pinned below the title (caller gates on item count > 10). */
  search?: PickerBottomSheetSearchConfig;
  children: ReactNode;
  ariaLabel?: string;
  className?: string;
  /** When false, hides the header close control (e.g. sheets with Back/Save). Default true. */
  showCloseButton?: boolean;
}

function handleSearchFocus(event: FocusEvent<HTMLInputElement>) {
  const input = event.currentTarget;
  requestAnimationFrame(() => {
    if (document.activeElement === input) {
      input.focus({ preventScroll: true });
    }
  });
}

/**
 * Foundation generic picker sheet — content-fitted height, conditional search,
 * fixed container, content-only scrolling.
 *
 * NOT a workspace or calendar sheet.
 */
export function PickerBottomSheet({
  open,
  onClose,
  title,
  titleId,
  search,
  children,
  ariaLabel,
  className,
  showCloseButton = true,
}: PickerBottomSheetProps) {
  const t = useT();
  const chromeRef = useRef<HTMLDivElement>(null);
  const contentMeasureRef = useRef<HTMLDivElement>(null);
  const keyboardInsetPx = useVisualViewportKeyboardInset(open && Boolean(search));
  const { sheetHeightPx, contentMaxHeightPx } = usePickerSheetHeight(
    open,
    chromeRef,
    contentMeasureRef,
    Boolean(search),
  );

  useModalLayerLock(open);
  useSearchSheetLock(open);

  if (!open) return null;

  const resolvedTitleId = titleId ?? "picker-bottom-sheet-title";
  const contentPaddingBottom = `calc(3.5rem + env(safe-area-inset-bottom) + ${keyboardInsetPx}px)`;

  return (
    <div
      className={cn(
        NUME_MODAL_OVERLAY_ENTER_CLASS,
        BOTTOM_SHEET_BACKDROP_CLASS,
        className,
      )}
    >
      <button
        type="button"
        aria-label={t("common.back")}
        className="absolute inset-0 touch-none"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel ?? title}
        aria-labelledby={resolvedTitleId}
        style={{
          height: sheetHeightPx ?? undefined,
          minHeight: PICKER_SHEET_MIN_HEIGHT,
          maxHeight: PICKER_SHEET_MAX_HEIGHT,
        }}
        className={cn(
          "absolute inset-x-0 bottom-0 mx-auto flex w-full max-w-lg flex-col overflow-hidden rounded-t-xl bg-background shadow-sm",
          BOTTOM_SHEET_ENTER_CLASS,
        )}
      >
        <div ref={chromeRef} className="shrink-0 border-b border-border bg-background">
          <div className={cn(SCREEN_HEADER_BAR_CLASS, "gap-3")}>
            <h2
              id={resolvedTitleId}
              className={cn(SCREEN_HEADER_TITLE_CLASS, "min-w-0 flex-1 text-start")}
            >
              {title}
            </h2>
            {showCloseButton ? (
              <button
                type="button"
                onClick={onClose}
                className="inline-flex size-11 shrink-0 items-center justify-center rounded-md text-foreground"
                aria-label={t("a11y.dismiss")}
              >
                <X className={SCREEN_HEADER_ACTION_ICON_CLASS} />
              </button>
            ) : null}
          </div>
          {search ? (
            <div className="px-4 pb-4">
              <Input
                value={search.value}
                onChange={(event) => search.onChange(event.target.value)}
                onFocus={handleSearchFocus}
                placeholder={search.placeholder}
                autoComplete="off"
              />
            </div>
          ) : null}
        </div>

        <div
          data-sheet-scroll
          className={cn(
            "overflow-y-auto overscroll-y-contain px-2 pb-2",
            PICKER_SHEET_CONTENT_TOP_PADDING,
          )}
          style={{
            maxHeight: contentMaxHeightPx,
            minHeight: search ? contentMaxHeightPx : undefined,
            paddingBottom: contentPaddingBottom,
          }}
        >
          <div ref={contentMeasureRef}>{children}</div>
        </div>
      </div>
    </div>
  );
}
