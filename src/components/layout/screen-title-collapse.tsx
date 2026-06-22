"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";

import { cn } from "@/lib/utils";

/** Header inner bar height — matches `h-14`. */
const HEADER_BAR_HEIGHT_PX = 56;

interface ScreenTitleCollapseContextValue {
  scrollRef: RefObject<HTMLElement | null>;
  /** True when the in-content large title has scrolled under the header zone. */
  titleCollapsed: boolean;
  registerPageTitle: (node: HTMLElement | null) => void;
}

const ScreenTitleCollapseContext =
  createContext<ScreenTitleCollapseContextValue | null>(null);

export function ScreenTitleCollapseProvider({
  scrollRef,
  children,
}: {
  scrollRef: RefObject<HTMLElement | null>;
  children: ReactNode;
}) {
  const [titleCollapsed, setTitleCollapsed] = useState(false);
  const pageTitleRef = useRef<HTMLElement | null>(null);
  const [hasPageTitle, setHasPageTitle] = useState(false);

  const registerPageTitle = useCallback((node: HTMLElement | null) => {
    pageTitleRef.current = node;
    setHasPageTitle(Boolean(node));
  }, []);

  useEffect(() => {
    const scrollRoot = scrollRef.current;
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
  }, [scrollRef, hasPageTitle]);

  return (
    <ScreenTitleCollapseContext.Provider
      value={{ scrollRef, titleCollapsed, registerPageTitle }}
    >
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
        "pb-4 text-2xl font-semibold leading-tight tracking-tight text-foreground",
        className,
      )}
    >
      {children}
    </h1>
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
        "block min-w-0 flex-1 truncate text-base font-semibold leading-tight transition-opacity duration-200",
        collapsed ? "opacity-100" : "opacity-0",
        className,
      )}
    >
      {children}
    </span>
  );
}
