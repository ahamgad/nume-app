"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { type RefObject, useLayoutEffect, useRef } from "react";

import {
  buildScrollRestorationKey,
  getScrollPosition,
  setScrollPosition,
} from "@/lib/navigation/scroll-restoration";

/**
 * Saves and restores `[data-app-scroll]` position across route remounts.
 * Attach to ScreenBody scroll containers so tab switches and back navigation
 * preserve list context.
 */
export function useScrollRestoration(
  scrollRef: RefObject<HTMLElement | null>,
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

    const saved = getScrollPosition(scrollKey);
    if (saved !== undefined) {
      node.scrollTop = saved;
    }

    return () => {
      setScrollPosition(scrollKeyRef.current, node.scrollTop);
    };
  }, [scrollKey, scrollRef]);
}
