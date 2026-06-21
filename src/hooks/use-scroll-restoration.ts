"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { type RefObject, useLayoutEffect, useRef } from "react";

import {
  buildScrollRestorationKey,
  clearScrollPosition,
  getScrollPosition,
  setScrollPosition,
} from "@/lib/navigation/scroll-restoration";

interface UseScrollRestorationOptions {
  resetOnMount?: boolean;
}

/**
 * Saves and restores `[data-app-scroll]` position across route remounts.
 * Attach to ScreenBody scroll containers so tab switches and back navigation
 * preserve list context.
 */
export function useScrollRestoration(
  scrollRef: RefObject<HTMLElement | null>,
  options?: UseScrollRestorationOptions,
) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const scrollKeyRef = useRef("");

  const search = searchParams.toString();
  const scrollKey = buildScrollRestorationKey(
    pathname,
    search ? `?${search}` : "",
  );

  useLayoutEffect(() => {
    scrollKeyRef.current = scrollKey;
    const node = scrollRef.current;
    if (!node) return;

    if (options?.resetOnMount) {
      clearScrollPosition(scrollKey);
      node.scrollTop = 0;
      return;
    }

    const saved = getScrollPosition(scrollKey);
    if (saved !== undefined) {
      node.scrollTop = saved;
    }

    return () => {
      setScrollPosition(scrollKeyRef.current, node.scrollTop);
    };
  }, [scrollKey, scrollRef, options?.resetOnMount]);
}
