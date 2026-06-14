"use client";

import {
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  useCallback,
  useRef,
  useState,
} from "react";

import { useT } from "@/providers/i18n-provider";
import { useModalLayerLock } from "@/providers/modal-layer-provider";
import {
  BOTTOM_SHEET_BACKDROP_CLASS,
  BOTTOM_SHEET_ENTER_CLASS,
  BOTTOM_SHEET_PANEL_CLASS,
  BottomSheetDragHandle,
} from "@/components/ui/bottom-sheet-chrome";
import { cn } from "@/lib/utils";

/** Matches in-flow `ScreenHeader` bar height (`h-14`). */
export const SELECTION_SHEET_HEADER_HEIGHT_PX = 56;

const SHEET_MIN_HEIGHT = "50dvh";
const SHEET_MAX_HEIGHT = `calc(100dvh - ${SELECTION_SHEET_HEADER_HEIGHT_PX * 2}px)`;
const DISMISS_DRAG_THRESHOLD_PX = 72;
const EXPAND_DRAG_THRESHOLD_PX = 40;

type SheetSnap = "half" | "full";

/**
 * Selection bottom sheet — pickers and searchable lists.
 * States: closed → half → full. Drag down from full → half; from half → dismiss.
 *
 * Half snap: content-driven height clamped between 50dvh and
 * `100dvh − (headerHeight × 2)`. Full snap: expands to max height.
 */
interface SelectionBottomSheetProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  header?: ReactNode;
  ariaLabelledBy?: string;
  ariaLabel?: string;
  className?: string;
  panelClassName?: string;
}

export function SelectionBottomSheet({
  open,
  onClose,
  children,
  header,
  ariaLabelledBy,
  ariaLabel,
  className,
  panelClassName,
}: SelectionBottomSheetProps) {
  useModalLayerLock(open);

  if (!open) return null;

  return (
    <SelectionBottomSheetContent
      onClose={onClose}
      header={header}
      ariaLabelledBy={ariaLabelledBy}
      ariaLabel={ariaLabel}
      className={className}
      panelClassName={panelClassName}
    >
      {children}
    </SelectionBottomSheetContent>
  );
}

function SelectionBottomSheetContent({
  onClose,
  children,
  header,
  ariaLabelledBy,
  ariaLabel,
  className,
  panelClassName,
}: Omit<SelectionBottomSheetProps, "open">) {
  const t = useT();
  const [snap, setSnap] = useState<SheetSnap>("half");
  const [dragOffset, setDragOffset] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef(0);
  const dragging = useRef(false);
  const isFull = snap === "full";

  const handleDismiss = useCallback(() => {
    setDragOffset(0);
    dragging.current = false;
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

      if (delta < -EXPAND_DRAG_THRESHOLD_PX && snap === "half") {
        setSnap("full");
        setDragOffset(0);
        dragging.current = false;
        event.currentTarget.releasePointerCapture(event.pointerId);
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
        if (snap === "full") {
          setSnap("half");
          setDragOffset(0);
          return;
        }
        handleDismiss();
        return;
      }

      setDragOffset(0);
    },
    [dragOffset, handleDismiss, snap],
  );

  const isDragging = dragOffset > 0;

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
        onClick={handleDismiss}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        className={cn(
          BOTTOM_SHEET_PANEL_CLASS,
          BOTTOM_SHEET_ENTER_CLASS,
          !isDragging &&
            "transition-[min-height,max-height,height,transform] duration-200 ease-out",
          panelClassName,
        )}
        style={{
          minHeight: isFull ? SHEET_MAX_HEIGHT : SHEET_MIN_HEIGHT,
          maxHeight: SHEET_MAX_HEIGHT,
          height: isFull ? SHEET_MAX_HEIGHT : "auto",
          transform: isDragging ? `translateY(${dragOffset}px)` : undefined,
        }}
      >
        <BottomSheetDragHandle
          className="cursor-grab active:cursor-grabbing"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        />
        {header ? (
          <div className="shrink-0 border-b border-border bg-background px-4 py-4">
            {header}
          </div>
        ) : null}
        <div
          ref={scrollRef}
          data-sheet-scroll
          className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-y-contain px-2 py-2 pb-[env(safe-area-inset-bottom)]"
        >
          {children}
        </div>
      </div>
    </div>
  );
}
