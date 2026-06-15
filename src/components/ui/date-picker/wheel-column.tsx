"use client";

import { useCallback, useEffect, useLayoutEffect, useRef } from "react";

import { cn } from "@/lib/utils";

export const WHEEL_ITEM_HEIGHT_PX = 52;
const WHEEL_VISIBLE_ROWS = 5;

interface WheelColumnProps<T> {
  items: readonly T[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  getKey: (item: T, index: number) => string;
  renderLabel: (item: T, index: number) => string;
  ariaLabel: string;
  className?: string;
}

export function WheelColumn<T>({
  items,
  selectedIndex,
  onSelect,
  getKey,
  renderLabel,
  ariaLabel,
  className,
}: WheelColumnProps<T>) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isUserScrollingRef = useRef(false);
  const scrollEndTimerRef = useRef<number | undefined>(undefined);
  const paddingPx =
    ((WHEEL_VISIBLE_ROWS - 1) * WHEEL_ITEM_HEIGHT_PX) / 2;

  const syncScrollToIndex = useCallback(
    (index: number, behavior: ScrollBehavior = "instant") => {
      const element = scrollRef.current;
      if (!element) return;
      element.scrollTo({
        top: index * WHEEL_ITEM_HEIGHT_PX,
        behavior,
      });
    },
    [],
  );

  useLayoutEffect(() => {
    if (isUserScrollingRef.current) return;
    syncScrollToIndex(selectedIndex);
  }, [selectedIndex, syncScrollToIndex]);

  const settleSelection = useCallback(() => {
    const element = scrollRef.current;
    if (!element) return;

    const rawIndex = Math.round(element.scrollTop / WHEEL_ITEM_HEIGHT_PX);
    const nextIndex = Math.max(0, Math.min(items.length - 1, rawIndex));

    isUserScrollingRef.current = false;
    syncScrollToIndex(nextIndex);

    if (nextIndex !== selectedIndex) {
      onSelect(nextIndex);
    }
  }, [items.length, onSelect, selectedIndex, syncScrollToIndex]);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;

    function handleScroll() {
      isUserScrollingRef.current = true;
      window.clearTimeout(scrollEndTimerRef.current);
      scrollEndTimerRef.current = window.setTimeout(settleSelection, 120);
    }

    element.addEventListener("scroll", handleScroll, { passive: true });
    element.addEventListener("scrollend", settleSelection);

    return () => {
      element.removeEventListener("scroll", handleScroll);
      element.removeEventListener("scrollend", settleSelection);
      window.clearTimeout(scrollEndTimerRef.current);
    };
  }, [settleSelection]);

  return (
    <div
      className={cn("relative min-h-0 flex-1", className)}
      style={{ height: WHEEL_VISIBLE_ROWS * WHEEL_ITEM_HEIGHT_PX }}
    >
      <div
        aria-label={ariaLabel}
        role="listbox"
        ref={scrollRef}
        className="h-full snap-y snap-mandatory overflow-y-auto overscroll-y-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <div aria-hidden style={{ height: paddingPx }} />
        {items.map((item, index) => {
          const selected = index === selectedIndex;
          return (
            <div
              key={getKey(item, index)}
              role="option"
              aria-selected={selected}
              className={cn(
                "flex snap-center items-center justify-center px-3 text-center transition-[color,font-weight] duration-150",
                selected
                  ? "text-xl font-semibold text-foreground"
                  : "text-lg font-medium text-muted-foreground",
              )}
              style={{ height: WHEEL_ITEM_HEIGHT_PX }}
            >
              {renderLabel(item, index)}
            </div>
          );
        })}
        <div aria-hidden style={{ height: paddingPx }} />
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-2 top-1/2 z-10 h-[52px] -translate-y-1/2 rounded-lg bg-muted/45"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-20 h-16 bg-gradient-to-b from-background via-background/80 to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-16 bg-gradient-to-t from-background via-background/80 to-transparent"
      />
    </div>
  );
}
