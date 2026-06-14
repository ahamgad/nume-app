"use client";

import {
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  useCallback,
  useRef,
  useState,
} from "react";

import { useT } from "@/providers/i18n-provider";
import { cn } from "@/lib/utils";

/** Half-sheet height (Apple Maps style default). */
const HALF_SHEET_HEIGHT = "50dvh";
const FULL_SHEET_HEIGHT = "min(92dvh, 640px)";
const DISMISS_DRAG_THRESHOLD_PX = 72;

type SheetSnap = "half" | "full";

/**
 * Selection bottom sheet — pickers and searchable lists.
 * Half sheet by default; drag handle up → full; drag down → dismiss.
 * Internal scroll only. No keyboard/viewport adjustments.
 */
interface SelectionBottomSheetProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  ariaLabelledBy?: string;
  ariaLabel?: string;
  className?: string;
  panelClassName?: string;
}

export function SelectionBottomSheet({
  open,
  onClose,
  children,
  ariaLabelledBy,
  ariaLabel,
  className,
  panelClassName,
}: SelectionBottomSheetProps) {
  const t = useT();
  const [snap, setSnap] = useState<SheetSnap>("half");
  const [dragOffset, setDragOffset] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef(0);
  const dragging = useRef(false);

  const handleDismiss = useCallback(() => {
    setDragOffset(0);
    onClose();
  }, [onClose]);

  const handlePointerDown = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    dragging.current = true;
    dragStartY.current = event.clientY;
    event.currentTarget.setPointerCapture(event.pointerId);
  }, []);

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!dragging.current) return;
      const delta = event.clientY - dragStartY.current;
      if (delta > 0) {
        setDragOffset(delta);
        return;
      }
      if (delta < -40 && snap === "half") {
        setSnap("full");
        setDragOffset(0);
        dragging.current = false;
      }
    },
    [snap],
  );

  const handlePointerUp = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!dragging.current) return;
      dragging.current = false;
      event.currentTarget.releasePointerCapture(event.pointerId);
      if (dragOffset >= DISMISS_DRAG_THRESHOLD_PX) {
        handleDismiss();
        return;
      }
      setDragOffset(0);
    },
    [dragOffset, handleDismiss],
  );

  if (!open) return null;

  return (
    <div className={cn("fixed inset-0 z-50 bg-black/40", className)}>
      <button
        type="button"
        aria-label={t("common.cancel")}
        className="absolute inset-0"
        onClick={handleDismiss}
      />
      <div
        key={open ? "open" : "closed"}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        className={cn(
          "absolute inset-x-0 bottom-0 mx-auto flex w-full max-w-lg flex-col rounded-t-xl border border-border bg-background shadow-sm transition-[height] duration-200 ease-out",
          panelClassName,
        )}
        style={{
          height: snap === "half" ? HALF_SHEET_HEIGHT : FULL_SHEET_HEIGHT,
          transform: dragOffset > 0 ? `translateY(${dragOffset}px)` : undefined,
        }}
      >
        <div
          className="flex shrink-0 cursor-grab flex-col items-center pt-2 active:cursor-grabbing"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <div className="h-1 w-10 rounded-full bg-muted-foreground/35" />
        </div>
        <div
          ref={scrollRef}
          className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-y-contain pb-[env(safe-area-inset-bottom)]"
        >
          {children}
        </div>
      </div>
    </div>
  );
}
