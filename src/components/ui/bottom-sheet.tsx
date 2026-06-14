"use client";

import { type ReactNode } from "react";

import { useKeyboard } from "@/providers/keyboard-provider";
import { useT } from "@/providers/i18n-provider";
import { cn } from "@/lib/utils";

/**
 * Keyboard-aware bottom sheet primitive.
 * Search fields inside sheets must NOT use autoFocus — keyboard opens on user tap only.
 */
interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  ariaLabelledBy?: string;
  ariaLabel?: string;
  className?: string;
  panelClassName?: string;
  /** Full-width anchored sheet vs compact confirmation card. */
  variant?: "sheet" | "compact";
}

export function BottomSheet({
  open,
  onClose,
  children,
  ariaLabelledBy,
  ariaLabel,
  className,
  panelClassName,
  variant = "sheet",
}: BottomSheetProps) {
  const t = useT();
  const { keyboardInset, viewportHeight, viewportOffsetTop } = useKeyboard();

  if (!open) return null;

  const isCompact = variant === "compact";
  const anchored = viewportHeight !== null;
  const sheetMaxHeight =
    !isCompact && anchored
      ? Math.max(Math.round(viewportHeight - 8), 160)
      : undefined;

  return (
    <div
      className={cn(
        "fixed inset-x-0 z-50 flex justify-center bg-black/40",
        isCompact
          ? "items-end px-4 pt-4 sm:items-center sm:pb-4"
          : "items-end",
        className,
      )}
      style={
        anchored
          ? {
              top: viewportOffsetTop,
              height: viewportHeight,
              bottom: "auto",
              paddingBottom: isCompact
                ? `calc(${keyboardInset}px + 1.5rem + env(safe-area-inset-bottom))`
                : undefined,
            }
          : undefined
      }
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
          "relative z-10 flex w-full flex-col border border-border bg-background shadow-sm",
          isCompact
            ? "max-w-sm rounded-xl p-5"
            : cn(
                "min-h-0 max-w-lg flex-col rounded-t-xl pb-[env(safe-area-inset-bottom)]",
                anchored ? "max-h-full" : "max-h-[min(80dvh,640px)]",
              ),
          panelClassName,
        )}
        style={
          sheetMaxHeight !== undefined ? { maxHeight: sheetMaxHeight } : undefined
        }
      >
        {children}
      </div>
    </div>
  );
}
