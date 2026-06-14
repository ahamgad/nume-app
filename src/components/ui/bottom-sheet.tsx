"use client";

import { type ReactNode, useEffect, useState } from "react";

import { useVisualViewportInset } from "@/hooks/use-visual-viewport-inset";
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
  const keyboardInset = useVisualViewportInset(open);
  const [viewportHeight, setViewportHeight] = useState<number | null>(null);

  useEffect(() => {
    if (!open || typeof window === "undefined") return;

    const viewport = window.visualViewport;
    if (!viewport) return;

    function updateHeight() {
      setViewportHeight(window.visualViewport?.height ?? null);
    }

    updateHeight();
    viewport.addEventListener("resize", updateHeight);
    return () => viewport.removeEventListener("resize", updateHeight);
  }, [open]);

  if (!open) return null;

  const isCompact = variant === "compact";
  const panelMaxHeight =
    !isCompact && viewportHeight !== null && keyboardInset > 0
      ? `${Math.max(viewportHeight - 8, 200)}px`
      : undefined;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex justify-center bg-black/40 transition-[padding-bottom] duration-200 ease-out",
        isCompact
          ? "items-end px-4 pt-4 sm:items-center sm:pb-4"
          : "items-end",
        className,
      )}
      style={{
        paddingBottom: isCompact
          ? `calc(${keyboardInset}px + 1.5rem + env(safe-area-inset-bottom))`
          : `${keyboardInset}px`,
      }}
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
          "relative z-10 flex w-full flex-col border border-border bg-background shadow-sm transition-transform duration-200 ease-out",
          isCompact
            ? "max-w-sm rounded-xl p-5"
            : "flex max-h-[min(80dvh,640px)] min-h-0 max-w-lg flex-col rounded-t-xl pb-[env(safe-area-inset-bottom)]",
          panelClassName,
        )}
        style={panelMaxHeight ? { maxHeight: panelMaxHeight } : undefined}
      >
        {children}
      </div>
    </div>
  );
}
