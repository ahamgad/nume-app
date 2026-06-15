"use client";

import type { FocusEvent, ReactNode } from "react";

import { useSearchSheetLock } from "@/hooks/use-search-sheet-lock";
import { useVisualViewportKeyboardInset } from "@/hooks/use-visual-viewport-keyboard-inset";
import { SCREEN_HEADER_TITLE_CLASS } from "@/components/layout/screen-header";
import {
  BOTTOM_SHEET_BACKDROP_CLASS,
  BOTTOM_SHEET_ENTER_CLASS,
} from "@/components/ui/bottom-sheet-chrome";
import { Input } from "@/components/ui/input";
import { SEARCH_SHEET_HEIGHT } from "@/lib/layout/search-sheet";
import { cn } from "@/lib/utils";
import { useT } from "@/providers/i18n-provider";
import { useModalLayerLock } from "@/providers/modal-layer-provider";

export interface SearchBottomSheetSearchConfig {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

export interface SearchBottomSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  titleId?: string;
  search?: SearchBottomSheetSearchConfig;
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
 * Foundation search / picker sheet.
 *
 * NOT a workspace sheet — no auto-focus, no automatic keyboard.
 * Fixed sheet container; fixed search header; results-only scrolling.
 */
export function SearchBottomSheet({
  open,
  onClose,
  title,
  titleId,
  search,
  children,
  ariaLabel,
  className,
}: SearchBottomSheetProps) {
  const t = useT();
  const keyboardInsetPx = useVisualViewportKeyboardInset(open && Boolean(search));

  useModalLayerLock(open);
  useSearchSheetLock(open);

  if (!open) return null;

  const resolvedTitleId = titleId ?? "search-bottom-sheet-title";
  const resultsPaddingBottom = `calc(0.5rem + env(safe-area-inset-bottom) + ${keyboardInsetPx}px)`;

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
        style={{ height: SEARCH_SHEET_HEIGHT, maxHeight: SEARCH_SHEET_HEIGHT }}
        className={cn(
          "absolute inset-x-0 bottom-0 mx-auto flex w-full max-w-lg flex-col overflow-hidden rounded-t-xl bg-background shadow-sm",
          BOTTOM_SHEET_ENTER_CLASS,
        )}
      >
        <header className="shrink-0 border-b border-border bg-background px-4 py-4">
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
        </header>

        <div
          data-sheet-scroll
          className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-y-contain px-2 py-2"
          style={{ paddingBottom: resultsPaddingBottom }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
