"use client";

import { ChevronLeft, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

import { usePullToRefresh } from "@/hooks/use-pull-to-refresh";
import { cn } from "@/lib/utils";
import { useT } from "@/providers/i18n-provider";

interface ScreenHeaderProps {
  title: string;
  mode?: "tab" | "stack";
  onBack?: () => void;
  rightAction?: ReactNode;
  className?: string;
}

export function ScreenHeader({
  title,
  mode = "tab",
  onBack,
  rightAction,
  className,
}: ScreenHeaderProps) {
  const router = useRouter();
  const t = useT();

  return (
    <header
      className={cn(
        "sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-sm pt-[env(safe-area-inset-top)]",
        className,
      )}
    >
      <div className="flex h-14 items-center px-2">
        {mode === "stack" ? (
          <button
            type="button"
            onClick={onBack ?? (() => router.back())}
            className="inline-flex size-11 items-center justify-center rounded-md text-foreground"
            aria-label={t("common.back")}
          >
            <ChevronLeft className="size-6 rtl:rotate-180" />
          </button>
        ) : (
          <div className="size-11 shrink-0" />
        )}
        <h1 className="min-w-0 flex-1 truncate px-1 text-base font-semibold">
          {title}
        </h1>
        {rightAction ? (
          <div className="flex size-11 shrink-0 items-center justify-center">
            {rightAction}
          </div>
        ) : (
          <div className="size-11 shrink-0" />
        )}
      </div>
    </header>
  );
}

interface ScreenBodyProps {
  children: ReactNode;
  className?: string;
  withTabBar?: boolean;
  withStickyFooter?: boolean;
  onRefresh?: () => Promise<void>;
}

export function ScreenBody({
  children,
  className,
  withTabBar = true,
  withStickyFooter = false,
  onRefresh,
}: ScreenBodyProps) {
  const {
    elementRef,
    isRefreshing,
    isAnimating,
    showIndicator,
    indicatorOpacity,
    offset,
    contentStyle,
    handleTransitionEnd,
  } = usePullToRefresh(onRefresh);

  const scrollPadding = cn(
    withTabBar && "pb-[calc(4.5rem+env(safe-area-inset-bottom))]",
    withStickyFooter && "pb-[calc(5.5rem+env(safe-area-inset-bottom))]",
  );

  if (!onRefresh) {
    return (
      <main
        className={cn(
          "flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-4 pt-4",
          "min-w-0 w-full max-w-full",
          scrollPadding,
          className,
        )}
      >
        {children}
      </main>
    );
  }

  return (
    <main
      ref={elementRef}
      className={cn(
        "relative flex-1 min-h-0 overflow-y-auto overflow-x-hidden",
        "min-w-0 w-full max-w-full",
        scrollPadding,
      )}
    >
      {showIndicator ? (
        <div
          aria-live="polite"
          aria-busy={isRefreshing}
          className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center justify-center"
          style={{ height: offset, opacity: indicatorOpacity }}
        >
          <Loader2
            className={cn(
              "size-8 text-muted-foreground",
              isRefreshing && "animate-spin",
            )}
          />
        </div>
      ) : null}
      <div
        style={contentStyle}
        onTransitionEnd={handleTransitionEnd}
        className={cn(
          "min-w-0 w-full max-w-full",
          offset > 0 || isAnimating ? "will-change-transform" : undefined,
        )}
      >
        <div className={cn("px-4 pt-4", className)}>{children}</div>
      </div>
    </main>
  );
}
