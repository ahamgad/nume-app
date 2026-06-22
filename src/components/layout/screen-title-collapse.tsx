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

/** Scroll distance (px) over which the page title morphs into the header title. */
const COLLAPSE_SCROLL_DISTANCE_PX = 56;

/** Header inner bar height — matches `h-14`. */
const HEADER_BAR_HEIGHT_PX = 56;

interface ScreenTitleCollapseContextValue {
  scrollRef: RefObject<HTMLElement | null>;
  /** 0 = large in-content title; 1 = compact header title. */
  collapseProgress: number;
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
  const [collapseProgress, setCollapseProgress] = useState(0);
  const pageTitleRef = useRef<HTMLElement | null>(null);
  const initialTitleTopRef = useRef(0);

  const registerPageTitle = useCallback((node: HTMLElement | null) => {
    pageTitleRef.current = node;
    if (node && scrollRef.current) {
      initialTitleTopRef.current = node.offsetTop;
    }
  }, [scrollRef]);

  useEffect(() => {
    const scrollRoot = scrollRef.current;
    if (!scrollRoot) return;

    function measureTitleTop() {
      const titleEl = pageTitleRef.current;
      if (titleEl) {
        initialTitleTopRef.current = titleEl.offsetTop;
      }
    }

    function updateProgress() {
      const root = scrollRef.current;
      const titleEl = pageTitleRef.current;
      if (!root || !titleEl) {
        setCollapseProgress(0);
        return;
      }

      measureTitleTop();
      const collapseStart = Math.max(
        0,
        initialTitleTopRef.current - HEADER_BAR_HEIGHT_PX,
      );
      const scrolled = root.scrollTop - collapseStart;
      const progress = Math.min(
        1,
        Math.max(0, scrolled / COLLAPSE_SCROLL_DISTANCE_PX),
      );
      setCollapseProgress(progress);
    }

    updateProgress();
    scrollRoot.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", measureTitleTop);

    return () => {
      scrollRoot.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", measureTitleTop);
    };
  }, [scrollRef]);

  const titleCollapsed = collapseProgress >= 0.98;

  return (
    <ScreenTitleCollapseContext.Provider
      value={{
        scrollRef,
        collapseProgress,
        titleCollapsed,
        registerPageTitle,
      }}
    >
      {children}
    </ScreenTitleCollapseContext.Provider>
  );
}

export function useScreenTitleCollapse() {
  return useContext(ScreenTitleCollapseContext);
}

/** Large in-content page title — morphs into the header title on scroll. */
export function ScreenPageTitle({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const context = useScreenTitleCollapse();
  const progress = context?.collapseProgress ?? 0;

  // 24px → 16px ≈ scale 0.667
  const scale = 1 - progress * (1 - 16 / 24);

  return (
    <h1
      ref={context ? (node) => context.registerPageTitle(node) : undefined}
      data-screen-page-title
      aria-hidden={progress > 0.5}
      className={cn(
        "origin-left pb-4 text-2xl font-semibold leading-tight tracking-tight text-foreground",
        className,
      )}
      style={{
        opacity: 1 - progress,
        transform: `scale(${scale})`,
        willChange: progress > 0 && progress < 1 ? "transform, opacity" : undefined,
      }}
    >
      {children}
    </h1>
  );
}

/** Compact header title slot — fades in as the in-content title morphs away. */
export function CollapsingHeaderTitle({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const context = useScreenTitleCollapse();
  const progress = context?.collapseProgress ?? 0;
  const scale = 16 / 24 + progress * (1 - 16 / 24);

  return (
    <span
      aria-hidden={progress < 0.5}
      className={cn(
        "block min-w-0 flex-1 truncate text-base font-semibold leading-tight",
        className,
      )}
      style={{
        opacity: progress,
        transform: `scale(${scale})`,
        transformOrigin: "left center",
        willChange: progress > 0 && progress < 1 ? "transform, opacity" : undefined,
      }}
    >
      {children}
    </span>
  );
}
