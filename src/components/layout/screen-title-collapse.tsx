"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { cn } from "@/lib/utils";
import {
  SCREEN_HEADER_BAR_HEIGHT_CLASS,
  SCREEN_HEADER_TITLE_CLASS,
  SCREEN_PAGE_TITLE_TO_CONTENT_GAP_CLASS,
} from "@/lib/layout/screen-spacing";

/** Header inner bar height in px (16px root) — matches {@link SCREEN_HEADER_BAR_HEIGHT_CLASS}. */
const HEADER_BAR_HEIGHT_PX = parseFloat(SCREEN_HEADER_BAR_HEIGHT_CLASS) * 16;

interface ScreenTitleCollapseContextValue {
  /** True when the in-content large title has scrolled under the header zone. */
  titleCollapsed: boolean;
  registerScrollRoot: (node: HTMLElement | null) => void;
  registerPageTitle: (node: HTMLElement | null) => void;
}

const ScreenTitleCollapseContext =
  createContext<ScreenTitleCollapseContextValue | null>(null);

export function ScreenTitleCollapseProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [titleCollapsed, setTitleCollapsed] = useState(false);
  const scrollRootRef = useRef<HTMLElement | null>(null);
  const pageTitleRef = useRef<HTMLElement | null>(null);
  const [hasScrollRoot, setHasScrollRoot] = useState(false);
  const [hasPageTitle, setHasPageTitle] = useState(false);

  const registerScrollRoot = useCallback((node: HTMLElement | null) => {
    scrollRootRef.current = node;
    setHasScrollRoot(Boolean(node));
  }, []);

  const registerPageTitle = useCallback((node: HTMLElement | null) => {
    pageTitleRef.current = node;
    setHasPageTitle(Boolean(node));
  }, []);

  useEffect(() => {
    const scrollRoot = scrollRootRef.current;
    const pageTitle = pageTitleRef.current;
    if (!scrollRoot || !pageTitle) {
      setTitleCollapsed(false);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setTitleCollapsed(!entry.isIntersecting);
      },
      {
        root: scrollRoot,
        threshold: 0,
        rootMargin: `-${HEADER_BAR_HEIGHT_PX}px 0px 0px 0px`,
      },
    );

    observer.observe(pageTitle);
    return () => observer.disconnect();
  }, [hasScrollRoot, hasPageTitle]);

  const value = useMemo(
    () => ({ titleCollapsed, registerScrollRoot, registerPageTitle }),
    [titleCollapsed, registerScrollRoot, registerPageTitle],
  );

  return (
    <ScreenTitleCollapseContext.Provider value={value}>
      {children}
    </ScreenTitleCollapseContext.Provider>
  );
}

export function useScreenTitleCollapse() {
  return useContext(ScreenTitleCollapseContext);
}

/**
 * Large in-content page title (iOS large-title style).
 * Scrolls naturally with content — no scale, morph, or fade.
 */
export function ScreenPageTitle({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const context = useScreenTitleCollapse();
  const collapsed = context?.titleCollapsed ?? false;

  return (
    <h1
      ref={context ? (node) => context.registerPageTitle(node) : undefined}
      data-screen-page-title
      aria-hidden={collapsed}
      className={cn(
        "text-2xl font-semibold leading-tight tracking-tight text-foreground",
        SCREEN_PAGE_TITLE_TO_CONTENT_GAP_CLASS,
        className,
      )}
    >
      {children}
    </h1>
  );
}

/**
 * Navigation title for pages with a static header label that swaps to the
 * large-title text when the in-content title scrolls under the header.
 */
export function DualCollapsingHeaderTitle({
  pageTitle,
  collapsedTitle,
  className,
}: {
  pageTitle: string;
  collapsedTitle: string;
  className?: string;
}) {
  const context = useScreenTitleCollapse();
  const collapsed = context?.titleCollapsed ?? false;

  return (
    <span
      className={cn(
        SCREEN_HEADER_TITLE_CLASS,
        "block transition-opacity duration-200",
        className,
      )}
    >
      {collapsed ? collapsedTitle : pageTitle}
    </span>
  );
}

/**
 * Compact navigation title — fades in when the large title scrolls under the header.
 */
export function CollapsingHeaderTitle({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const context = useScreenTitleCollapse();
  const collapsed = context?.titleCollapsed ?? false;

  return (
    <span
      aria-hidden={!collapsed}
      className={cn(
        SCREEN_HEADER_TITLE_CLASS,
        "transition-opacity duration-200",
        collapsed ? "opacity-100" : "opacity-0",
        className,
      )}
    >
      {children}
    </span>
  );
}
