"use client";

import { type ReactNode } from "react";

import {
  BOTTOM_SHEET_BACKDROP_CLASS,
  BOTTOM_SHEET_ENTER_CLASS,
  BottomSheetHeaderlessContent,
  BottomSheetPanel,
} from "@/components/ui/bottom-sheet-chrome";
import { NUME_MODAL_OVERLAY_ENTER_CLASS } from "@/lib/layout/motion";
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
        NUME_MODAL_OVERLAY_ENTER_CLASS,
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
      <BottomSheetPanel
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        className={cn(BOTTOM_SHEET_ENTER_CLASS, panelClassName)}
      >
        <BottomSheetHeaderlessContent>{children}</BottomSheetHeaderlessContent>
      </BottomSheetPanel>
    </div>
  );
}
