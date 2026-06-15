"use client";

import { Check, ChevronLeft } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";

import {
  SCREEN_HEADER_BAR_CLASS,
  SCREEN_HEADER_ICON_CLASS,
  SCREEN_HEADER_TITLE_CLASS,
} from "@/components/layout/screen-header";
import {
  BOTTOM_SHEET_BACKDROP_CLASS,
  BOTTOM_SHEET_ENTER_CLASS,
} from "@/components/ui/bottom-sheet-chrome";
import { IMMERSIVE_SHEET_HEIGHT } from "@/lib/layout/immersive-sheet";
import { cn } from "@/lib/utils";
import { useT } from "@/providers/i18n-provider";
import { useModalLayerLock } from "@/providers/modal-layer-provider";

interface ImmersiveBottomSheetProps {
  title: string;
  onDismiss: () => void;
  onConfirm: () => void;
  confirmAriaLabel: string;
  confirmDisabled?: boolean;
  ariaLabel?: string;
  bodyClassName?: string;
  bodyStyle?: CSSProperties;
  children: ReactNode;
}

export function ImmersiveBottomSheet({
  title,
  onDismiss,
  onConfirm,
  confirmAriaLabel,
  confirmDisabled = false,
  ariaLabel,
  bodyClassName,
  bodyStyle,
  children,
}: ImmersiveBottomSheetProps) {
  const t = useT();

  useModalLayerLock(true);

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 animate-in fade-in-0 duration-200",
        BOTTOM_SHEET_BACKDROP_CLASS,
      )}
    >
      <button
        type="button"
        aria-label={t("common.back")}
        className="absolute inset-0"
        onClick={onDismiss}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel ?? title}
        style={{ height: IMMERSIVE_SHEET_HEIGHT, maxHeight: IMMERSIVE_SHEET_HEIGHT }}
        className={cn(
          "absolute inset-x-0 bottom-0 mx-auto flex w-full max-w-lg flex-col overflow-hidden rounded-t-xl bg-background shadow-sm",
          BOTTOM_SHEET_ENTER_CLASS,
        )}
      >
        <header className="shrink-0 border-b border-border">
          <div className={SCREEN_HEADER_BAR_CLASS}>
            <button
              type="button"
              onClick={onDismiss}
              className="inline-flex size-11 items-center justify-center rounded-md text-foreground"
              aria-label={t("common.back")}
            >
              <ChevronLeft className={cn(SCREEN_HEADER_ICON_CLASS, "rtl:rotate-180")} />
            </button>
            <h2 className={cn(SCREEN_HEADER_TITLE_CLASS, "text-center")}>{title}</h2>
            <button
              type="button"
              onClick={onConfirm}
              disabled={confirmDisabled}
              className="inline-flex size-11 items-center justify-center rounded-md text-foreground disabled:opacity-40"
              aria-label={confirmAriaLabel}
            >
              <Check className={SCREEN_HEADER_ICON_CLASS} strokeWidth={2.25} />
            </button>
          </div>
        </header>

        <div
          className={cn(
            "flex min-h-0 flex-1 flex-col overflow-hidden overscroll-y-contain",
            bodyClassName,
          )}
          style={bodyStyle}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
