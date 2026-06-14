"use client";

import {
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";

import { useT } from "@/providers/i18n-provider";
import { useModalLayerLock } from "@/providers/modal-layer-provider";
import { cn } from "@/lib/utils";

const HALF_SHEET_HEIGHT = "50dvh";
const LARGE_HALF_SHEET_HEIGHT = "66dvh";
const FULL_SHEET_HEIGHT = "min(92dvh, 640px)";
const LARGE_DATASET_THRESHOLD = 10;
const DISMISS_DRAG_THRESHOLD_PX = 72;
const EXPAND_DRAG_THRESHOLD_PX = 40;

type SheetSnap = "half" | "full";

function resolveHalfSheetHeight(
  optionCount?: number,
  defaultHalfSize?: "default" | "large",
) {
  if (defaultHalfSize === "large") {
    return LARGE_HALF_SHEET_HEIGHT;
  }
  if (optionCount !== undefined && optionCount > LARGE_DATASET_THRESHOLD) {
    return LARGE_HALF_SHEET_HEIGHT;
  }
  return HALF_SHEET_HEIGHT;
}

/**
 * Selection bottom sheet — pickers and searchable lists.
 * States: closed → half → full. Drag down from full → half; from half → dismiss.
 */
interface SelectionBottomSheetProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  header?: ReactNode;
  optionCount?: number;
  defaultHalfSize?: "default" | "large";
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
  optionCount,
  defaultHalfSize,
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
      optionCount={optionCount}
      defaultHalfSize={defaultHalfSize}
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
  optionCount,
  defaultHalfSize,
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
  const halfSheetHeight = useMemo(
    () => resolveHalfSheetHeight(optionCount, defaultHalfSize),
    [defaultHalfSize, optionCount],
  );

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
    <div className={cn("fixed inset-0 z-50 bg-black/40", className)}>
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
          "absolute inset-x-0 bottom-0 mx-auto flex w-full max-w-lg flex-col rounded-t-xl border border-border bg-background shadow-sm",
          !isDragging && "transition-[height,transform] duration-200 ease-out",
          panelClassName,
        )}
        style={{
          height: snap === "half" ? halfSheetHeight : FULL_SHEET_HEIGHT,
          transform: isDragging ? `translateY(${dragOffset}px)` : undefined,
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
