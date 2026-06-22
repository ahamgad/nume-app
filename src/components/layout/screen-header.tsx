"use client";

import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { type ReactNode, useCallback, useRef } from "react";

import { HeaderIconButton } from "@/components/layout/header-icon-button";
import {
  CollapsingHeaderTitle,
  DualCollapsingHeaderTitle,
  useScreenTitleCollapse,
} from "@/components/layout/screen-title-collapse";
import { PullToRefreshIndicator } from "@/components/ui/pull-to-refresh-indicator";
import { usePullToRefresh } from "@/hooks/use-pull-to-refresh";
import { useFocusScrollIntoView } from "@/hooks/use-focus-scroll-into-view";
import { useScrollRestoration } from "@/hooks/use-scroll-restoration";
import { isFreshCreateFlowPath } from "@/lib/navigation/create-flow-paths";
import { KEYBOARD_SNAP_EXPERIMENT_D_FIXED_HEADER } from "@/lib/layout/keyboard-snap-investigation";
import {
  getScreenBodyScrollPadding,
  getScreenBodyTopPadding,
  SCREEN_HEADER_BAR_CLASS,
  SCREEN_HEADER_TITLE_CLASS,
  SCREEN_HEADER_TRAILING_SLOT_CLASS,
  SCREEN_HEADER_ZONE_TOP,
} from "@/lib/layout/screen-spacing";
import { isTabBarVisible } from "@/lib/layout/tab-bar-visibility";
import { cn } from "@/lib/utils";
import { useModalLayer } from "@/providers/modal-layer-provider";
import { useT } from "@/providers/i18n-provider";

interface ScreenHeaderProps {
  title: string;
  mode?: "tab" | "stack";
  /** Large title lives in page content; header title appears after scroll. */
  collapsibleTitle?: boolean;
  /** When set with collapsibleTitle, swaps from title to this label on scroll. */
  collapsedTitle?: string;
  onBack?: () => void;
  rightAction?: ReactNode;
  className?: string;
}

/** Re-export for sheet chrome and legacy imports. */
export {
  SCREEN_HEADER_BAR_CLASS,
  SCREEN_HEADER_ICON_BUTTON_SIZE_CLASS,
  SCREEN_HEADER_TEXT_ACTION_CLASS,
  SCREEN_HEADER_TITLE_CLASS,
  SCREEN_HEADER_TRAILING_SLOT_CLASS,
} from "@/lib/layout/screen-spacing";

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

export function ScreenHeader({
  title,
  mode = "tab",
  collapsibleTitle = false,
  collapsedTitle,
  onBack,
  rightAction,
  className,
}: ScreenHeaderProps) {
  const router = useRouter();
  const t = useT();
  const collapse = useScreenTitleCollapse();
  const titleCollapsed = collapse?.titleCollapsed ?? false;
  const showHeaderBorder = collapsibleTitle ? titleCollapsed : true;

  return (
    <header
      data-screen-header
      className={cn(
        "bg-background pt-[env(safe-area-inset-top)]",
        showHeaderBorder ? "border-b border-border" : "border-b border-transparent",
        KEYBOARD_SNAP_EXPERIMENT_D_FIXED_HEADER
          ? "fixed inset-x-0 top-0 z-40 mx-auto w-full max-w-lg"
          : "z-30 shrink-0",
        collapsibleTitle && "transition-[border-color] duration-200",
        className,
      )}
    >
      <div className={SCREEN_HEADER_BAR_CLASS}>
        {mode === "stack" ? (
          <HeaderIconButton
            onClick={onBack ?? (() => router.back())}
            aria-label={t("common.back")}
          />
        ) : null}
        {collapsibleTitle ? (
          collapsedTitle ? (
            <DualCollapsingHeaderTitle
              pageTitle={title}
              collapsedTitle={collapsedTitle}
            />
          ) : (
            <CollapsingHeaderTitle>{title}</CollapsingHeaderTitle>
          )
        ) : (
          <h1 className={SCREEN_HEADER_TITLE_CLASS}>{title}</h1>
        )}
        {rightAction ? (
          <div className={SCREEN_HEADER_TRAILING_SLOT_CLASS}>{rightAction}</div>
        ) : null}
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
  resetScrollOnMount,
  onRefresh,
}: ScreenBodyProps) {
  const pathname = usePathname();
  const scrollRef = useRef<HTMLElement>(null);
  const { isModalOpen } = useModalLayer();
  const registerScrollRoot = useScreenTitleCollapse()?.registerScrollRoot;

  const shouldResetScroll =
    resetScrollOnMount ?? isFreshCreateFlowPath(pathname);

  useScrollRestoration(scrollRef, { resetOnMount: shouldResetScroll });
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
      registerScrollRoot?.(node);
    },
    [elementRef, registerScrollRoot],
  );

  const setScrollRef = useCallback(
    (node: HTMLElement | null) => {
      scrollRef.current = node;
      registerScrollRoot?.(node);
    },
    [registerScrollRoot],
  );

  if (!onRefresh) {
    return (
      <main
        ref={setScrollRef}
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
