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

interface ScreenTitleCollapseContextValue {
  scrollRef: RefObject<HTMLElement | null>;
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

  const registerPageTitle = useCallback((node: HTMLElement | null) => {
    pageTitleRef.current = node;
  }, []);

  useEffect(() => {
    const scrollRoot = scrollRef.current;
    const pageTitle = pageTitleRef.current;
    if (!scrollRoot || !pageTitle) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setTitleCollapsed(!entry.isIntersecting);
      },
      {
        root: scrollRoot,
        threshold: 0,
        rootMargin: "-4px 0px 0px 0px",
      },
    );

    observer.observe(pageTitle);
    return () => observer.disconnect();
  }, [scrollRef]);

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

/** Large in-content page title for the collapsible header pattern. */
export function ScreenPageTitle({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const context = useScreenTitleCollapse();

  return (
    <h1
      ref={context ? (node) => context.registerPageTitle(node) : undefined}
      data-screen-page-title
      className={cn(
        "text-2xl font-semibold leading-tight tracking-tight text-foreground",
        className,
      )}
    >
      {children}
    </h1>
  );
}
