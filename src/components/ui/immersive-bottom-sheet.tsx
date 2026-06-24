"use client";

import type { CSSProperties, ReactNode } from "react";

import { HeaderIconButton } from "@/components/layout/header-icon-button";
import { useImmersiveWorkspaceLock } from "@/hooks/use-immersive-workspace-lock";
import {
  BOTTOM_SHEET_BACKDROP_CLASS,
  BOTTOM_SHEET_ENTER_CLASS,
  BottomSheetHeader,
  BottomSheetPanel,
} from "@/components/ui/bottom-sheet-chrome";
import { SCREEN_HEADER_TEXT_ACTION_CLASS } from "@/components/layout/screen-header";
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
  /** Fires on pointerdown for back / backdrop — before input blur (field editor discard guard). */
  onDiscardPointerDown?: () => void;
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
  onDiscardPointerDown,
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
        onPointerDown={() => onDiscardPointerDown?.()}
        onClick={onDismiss}
      />
      <BottomSheetPanel
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel ?? title}
        style={{ height: sheetHeight, maxHeight: sheetHeight }}
        className={cn(
          BOTTOM_SHEET_ENTER_CLASS,
          isWorkspace && "touch-none overscroll-none",
        )}
      >
        <BottomSheetHeader
          title={title}
          leading={
            <HeaderIconButton
              onPointerDown={() => onDiscardPointerDown?.()}
              onClick={onDismiss}
              aria-label={t("common.back")}
            />
          }
          trailing={
            <button
              type="button"
              onClick={onConfirm}
              disabled={confirmDisabled}
              className={SCREEN_HEADER_TEXT_ACTION_CLASS}
              aria-label={saveAriaLabel}
            >
              {saveLabel}
            </button>
          }
        />

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
      </BottomSheetPanel>
    </div>
  );
}
