"use client";

import { usePathname } from "next/navigation";
import { ChevronLeft, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { type ReactNode, useCallback, useRef } from "react";

import { PullToRefreshIndicator } from "@/components/ui/pull-to-refresh-indicator";
import { usePullToRefresh } from "@/hooks/use-pull-to-refresh";
import { useFocusScrollIntoView } from "@/hooks/use-focus-scroll-into-view";
import { useScrollRestoration } from "@/hooks/use-scroll-restoration";
import { KEYBOARD_SNAP_EXPERIMENT_D_FIXED_HEADER } from "@/lib/layout/keyboard-snap-investigation";
import {
  getScreenBodyScrollPadding,
  getScreenBodyTopPadding,
  SCREEN_HEADER_ZONE_TOP,
} from "@/lib/layout/screen-spacing";
import { isTabBarVisible } from "@/lib/layout/tab-bar-visibility";
import { cn } from "@/lib/utils";
import { useModalLayer } from "@/providers/modal-layer-provider";
import { useT } from "@/providers/i18n-provider";

interface ScreenHeaderProps {
  title: string;
  mode?: "tab" | "stack";
  onBack?: () => void;
  rightAction?: ReactNode;
  className?: string;
}

/** Inner bar — matches `h-14` touch layout across stack/tab headers. */
export const SCREEN_HEADER_BAR_CLASS = "flex h-14 items-center px-2";

/** Leading header icons (back, confirm). */
export const SCREEN_HEADER_ICON_CLASS = "size-6";

/** Trailing header action icons (e.g. Plus). */
export const SCREEN_HEADER_ACTION_ICON_CLASS = "size-5";

/** Trailing header text action with leading plus icon. */
export function ScreenHeaderActionButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-11 max-w-[7.5rem] items-center justify-end gap-1 rounded-md px-1 text-sm font-medium text-foreground sm:max-w-none"
      aria-label={label}
    >
      <Plus className={cn(SCREEN_HEADER_ACTION_ICON_CLASS, "shrink-0")} />
      <span className="truncate">{label}</span>
    </button>
  );
}

/** Stack/tab header titles. */
export const SCREEN_HEADER_TITLE_CLASS =
  "min-w-0 flex-1 truncate px-1 text-base font-semibold";

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
      data-screen-header
      className={cn(
        "border-b border-border bg-background pt-[env(safe-area-inset-top)]",
        KEYBOARD_SNAP_EXPERIMENT_D_FIXED_HEADER
          ? "fixed inset-x-0 top-0 z-40 mx-auto w-full max-w-lg"
          : "z-30 shrink-0",
        className,
      )}
    >
      <div className={SCREEN_HEADER_BAR_CLASS}>
        {mode === "stack" ? (
          <button
            type="button"
            onClick={onBack ?? (() => router.back())}
            className="inline-flex size-11 items-center justify-center rounded-md text-foreground"
            aria-label={t("common.back")}
          >
            <ChevronLeft className={cn(SCREEN_HEADER_ICON_CLASS, "rtl:rotate-180")} />
          </button>
        ) : (
          <div className="size-11 shrink-0" />
        )}
        <h1 className={SCREEN_HEADER_TITLE_CLASS}>{title}</h1>
        {rightAction ? (
          <div className="flex min-h-11 shrink-0 items-center justify-end">
            {rightAction}
          </div>
        ) : (
          <div className="size-11 shrink-0" />
        )}
      </div>
    </header>
  );
}

/** Ensures header + body column layout inside AppShell. */
export function ScreenLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      {children}
    </div>
  );
}

interface ScreenBodyProps {
  children: ReactNode;
  className?: string;
  /** When omitted, inferred from the current route (tab bar visible or not). */
  withTabBar?: boolean;
  withStickyFooter?: boolean;
  /** When true, always opens at the top instead of restoring scroll position. */
  resetScrollOnMount?: boolean;
  onRefresh?: () => Promise<void>;
}

export function ScreenBody({
  children,
  className,
  withTabBar,
  withStickyFooter = false,
  resetScrollOnMount = false,
  onRefresh,
}: ScreenBodyProps) {
  const pathname = usePathname();
  const scrollRef = useRef<HTMLElement>(null);
  const { isModalOpen } = useModalLayer();

  useScrollRestoration(scrollRef, { resetOnMount: resetScrollOnMount });
  useFocusScrollIntoView(scrollRef, !isModalOpen, withStickyFooter);

  const tabBarVisible = withTabBar ?? isTabBarVisible(pathname);

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

  const scrollPadding = getScreenBodyScrollPadding({
    tabBarVisible,
    withStickyFooter,
  });
  const topPadding = getScreenBodyTopPadding(
    KEYBOARD_SNAP_EXPERIMENT_D_FIXED_HEADER,
  );
  const hasFixedHeader = KEYBOARD_SNAP_EXPERIMENT_D_FIXED_HEADER;

  const scrollContainerClassName = cn(
    "flex-1 min-h-0 overflow-x-hidden px-4",
    topPadding,
    "min-w-0 w-full max-w-full overscroll-y-contain",
    isModalOpen
      ? "overflow-hidden touch-none"
      : "overflow-y-auto",
    scrollPadding,
  );

  const setScrollContainerRef = useCallback(
    (node: HTMLElement | null) => {
      scrollRef.current = node;
      elementRef.current = node;
    },
    [elementRef],
  );

  if (!onRefresh) {
    return (
      <main
        ref={scrollRef}
        data-app-scroll
        className={cn(scrollContainerClassName, className)}
      >
        {children}
      </main>
    );
  }

  return (
    <main
      ref={setScrollContainerRef}
      data-app-scroll
      className={cn("relative", scrollContainerClassName)}
    >
      {showIndicator ? (
        <div
          aria-live="polite"
          aria-busy={isRefreshing}
          className="pointer-events-none absolute inset-x-0 z-20 flex items-end justify-center"
          style={{
            top: hasFixedHeader ? SCREEN_HEADER_ZONE_TOP : 0,
            height: hasFixedHeader
              ? `max(${offset}px, 2.75rem)`
              : offset,
            paddingBottom: hasFixedHeader ? "0.375rem" : 0,
          }}
        >
          <PullToRefreshIndicator
            isRefreshing={isRefreshing}
            opacity={indicatorOpacity}
          />
        </div>
      ) : null}
      <div
        style={contentStyle}
        onTransitionEnd={handleTransitionEnd}
        className={cn(
          "min-w-0 w-full max-w-full",
          offset > 0 || isAnimating ? "will-change-transform" : undefined,
          className,
        )}
      >
        {children}
      </div>
    </main>
  );
}
