"use client";

import {
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  useCallback,
  useRef,
  useState,
} from "react";

import { useKeyboardScroll } from "@/hooks/use-keyboard-scroll";
import { useT } from "@/providers/i18n-provider";
import { cn } from "@/lib/utils";

/** Half-sheet height (Apple Maps style default). */
const HALF_SHEET_HEIGHT = "50dvh";
const FULL_SHEET_HEIGHT = "min(92dvh, 640px)";
const DISMISS_DRAG_THRESHOLD_PX = 72;

type SheetSnap = "half" | "full";

/**
 * Native-style bottom sheet (Phase 3.5):
 * - Default half sheet; drag up / scroll expand → full; drag down → dismiss.
 * - Selection sheets: ≤10 options → no search (parent omits search); >10 → search visible.
 * - Keyboard uses the shared `useKeyboardScroll` strategy (no viewport resize).
 */
interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  ariaLabelledBy?: string;
  ariaLabel?: string;
  className?: string;
  panelClassName?: string;
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
  const [snap, setSnap] = useState<SheetSnap>("half");
  const [dragOffset, setDragOffset] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef(0);
  const dragging = useRef(false);
  const sheetKey = open ? "open" : "closed";

  useKeyboardScroll(scrollRef, { bottomReservePx: 16 });

  const handleDismiss = useCallback(() => {
    setDragOffset(0);
    onClose();
  }, [onClose]);

  const handlePointerDown = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    dragging.current = true;
    dragStartY.current = event.clientY;
    event.currentTarget.setPointerCapture(event.pointerId);
  }, []);

  const handlePointerMove = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
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
  }, [snap]);

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

  const handleScroll = useCallback(() => {
    const node = scrollRef.current;
    if (!node || snap === "full") return;
    if (node.scrollTop <= 0 && node.scrollHeight > node.clientHeight) {
      setSnap("full");
    }
  }, [snap]);

  if (!open) return null;

  const isCompact = variant === "compact";

  if (isCompact) {
    return (
      <div
        className={cn(
          "fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-4 pt-4 sm:items-center sm:pb-4",
          className,
        )}
      >
        <button
          type="button"
          aria-label={t("common.cancel")}
          className="absolute inset-0"
          onClick={handleDismiss}
        />
        <div
          role="dialog"
          aria-modal="true"
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          className={cn(
            "relative z-10 w-full max-w-sm rounded-xl border border-border bg-background p-5 shadow-sm",
            panelClassName,
          )}
        >
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("fixed inset-0 z-50 bg-black/40", className)}>
      <button
        type="button"
        aria-label={t("common.cancel")}
        className="absolute inset-0"
        onClick={handleDismiss}
      />
      <div
        key={sheetKey}
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
          onScroll={handleScroll}
          className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-y-contain pb-[env(safe-area-inset-bottom)]"
        >
          {children}
        </div>
      </div>
    </div>
  );
}
