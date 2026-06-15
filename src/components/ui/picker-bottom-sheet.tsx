"use client";

import { useRef, type FocusEvent, type ReactNode } from "react";

import { usePickerSheetHeight } from "@/hooks/use-picker-sheet-height";
import { useSearchSheetLock } from "@/hooks/use-search-sheet-lock";
import { useVisualViewportKeyboardInset } from "@/hooks/use-visual-viewport-keyboard-inset";
import { SCREEN_HEADER_TITLE_CLASS } from "@/components/layout/screen-header";
import {
  BOTTOM_SHEET_BACKDROP_CLASS,
  BOTTOM_SHEET_ENTER_CLASS,
} from "@/components/ui/bottom-sheet-chrome";
import { Input } from "@/components/ui/input";
import {
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
        "fixed inset-0 z-50 animate-in fade-in-0 duration-200",
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
        <div
          ref={chromeRef}
          className="shrink-0 border-b border-border bg-background px-4 py-4"
        >
          <h2 id={resolvedTitleId} className={SCREEN_HEADER_TITLE_CLASS}>
            {title}
          </h2>
          {search ? (
            <Input
              value={search.value}
              onChange={(event) => search.onChange(event.target.value)}
              onFocus={handleSearchFocus}
              placeholder={search.placeholder}
              className="mt-3"
              autoComplete="off"
            />
          ) : null}
        </div>

        <div
          data-sheet-scroll
          className="overflow-y-auto overscroll-y-contain px-2 py-2"
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
