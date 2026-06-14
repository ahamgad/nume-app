"use client";

import { type ReactNode } from "react";

import {
  BOTTOM_SHEET_BACKDROP_CLASS,
  BOTTOM_SHEET_ENTER_CLASS,
  CONFIRMATION_SHEET_PANEL_CLASS,
  BottomSheetDragHandle,
} from "@/components/ui/bottom-sheet-chrome";
import { useT } from "@/providers/i18n-provider";
import { useModalLayerLock } from "@/providers/modal-layer-provider";
import { cn } from "@/lib/utils";

/**
 * Confirmation bottom sheet — compact, bottom-anchored, content-driven.
 * Visually aligned with SelectionBottomSheet; no expansion or drag logic.
 */
interface ConfirmationBottomSheetProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  ariaLabelledBy?: string;
  ariaLabel?: string;
  className?: string;
  panelClassName?: string;
}

export function ConfirmationBottomSheet({
  open,
  onClose,
  children,
  ariaLabelledBy,
  ariaLabel,
  className,
  panelClassName,
}: ConfirmationBottomSheetProps) {
  const t = useT();

  useModalLayerLock(open);

  if (!open) return null;

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
        aria-label={t("common.cancel")}
        className="absolute inset-0"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        className={cn(
          CONFIRMATION_SHEET_PANEL_CLASS,
          BOTTOM_SHEET_ENTER_CLASS,
          panelClassName,
        )}
      >
        <BottomSheetDragHandle />
        <div className="px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-5">
          {children}
        </div>
      </div>
    </div>
  );
}
