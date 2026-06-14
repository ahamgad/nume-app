"use client";

import { type ReactNode } from "react";

import { useT } from "@/providers/i18n-provider";
import { useModalLayerLock } from "@/providers/modal-layer-provider";
import { cn } from "@/lib/utils";

/**
 * Confirmation bottom sheet — compact, bottom-anchored, fixed height.
 * No expansion, internal scroll, search, or drag logic.
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
        "fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-4",
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
          "relative z-10 mb-[calc(1rem+env(safe-area-inset-bottom))] w-full max-w-sm rounded-xl border border-border bg-background p-5 shadow-sm",
          panelClassName,
        )}
      >
        {children}
      </div>
    </div>
  );
}
