"use client";

import { ChevronLeft } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";

import { useImmersiveWorkspaceLock } from "@/hooks/use-immersive-workspace-lock";
import {
  SCREEN_HEADER_BAR_CLASS,
  SCREEN_HEADER_ICON_CLASS,
  SCREEN_HEADER_TITLE_CLASS,
} from "@/components/layout/screen-header";
import {
  BOTTOM_SHEET_BACKDROP_CLASS,
  BOTTOM_SHEET_ENTER_CLASS,
} from "@/components/ui/bottom-sheet-chrome";
import { NUME_MODAL_OVERLAY_ENTER_CLASS } from "@/lib/layout/motion";
import { IMMERSIVE_SHEET_HEIGHT } from "@/lib/layout/immersive-sheet";
import { cn } from "@/lib/utils";
import { useT } from "@/providers/i18n-provider";
import { useModalLayerLock } from "@/providers/modal-layer-provider";

interface ImmersiveBottomSheetProps {
  title: string;
  onDismiss: () => void;
  onConfirm: () => void;
  confirmDisabled?: boolean;
  confirmLabel?: string;
  confirmAriaLabel?: string;
  ariaLabel?: string;
  sheetHeight?: string;
  /** Workspace mode locks document scroll and fixes the sheet body (Field Editor). */
  variant?: "default" | "workspace";
  bodyClassName?: string;
  bodyStyle?: CSSProperties;
  children: ReactNode;
}

export function ImmersiveBottomSheet({
  title,
  onDismiss,
  onConfirm,
  confirmDisabled = false,
  confirmLabel,
  confirmAriaLabel,
  ariaLabel,
  sheetHeight = IMMERSIVE_SHEET_HEIGHT,
  variant = "default",
  bodyClassName,
  bodyStyle,
  children,
}: ImmersiveBottomSheetProps) {
  const t = useT();
  const saveLabel = confirmLabel ?? t("common.save");
  const saveAriaLabel = confirmAriaLabel ?? saveLabel;
  const isWorkspace = variant === "workspace";

  useModalLayerLock(true);
  useImmersiveWorkspaceLock(isWorkspace);

  return (
    <div
      className={cn(
        NUME_MODAL_OVERLAY_ENTER_CLASS,
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
        style={{ height: sheetHeight, maxHeight: sheetHeight }}
        className={cn(
          "absolute inset-x-0 bottom-0 mx-auto flex w-full max-w-lg flex-col overflow-hidden rounded-t-xl bg-background shadow-sm",
          BOTTOM_SHEET_ENTER_CLASS,
          isWorkspace && "touch-none overscroll-none",
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
            <h2 className={SCREEN_HEADER_TITLE_CLASS}>{title}</h2>
            <button
              type="button"
              onClick={onConfirm}
              disabled={confirmDisabled}
              className="inline-flex h-11 min-w-11 shrink-0 items-center justify-center rounded-md px-2 text-sm font-semibold text-foreground disabled:opacity-40"
              aria-label={saveAriaLabel}
            >
              {saveLabel}
            </button>
          </div>
        </header>

        <div
          className={cn(
            "flex min-h-0 flex-1 flex-col overscroll-y-contain",
            isWorkspace ? "overflow-hidden touch-none" : "overflow-hidden",
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
