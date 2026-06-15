"use client";

import { usePathname } from "next/navigation";
import { type ReactNode, useEffect, useRef, useState } from "react";

import { useLocale } from "@/providers/i18n-provider";
import { cn } from "@/lib/utils";

type ScreenDirection = "forward" | "back";

export function ScreenTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const locale = useLocale();
  const isRtl = locale === "ar";
  const stackRef = useRef<string[]>([]);
  const pendingDirectionRef = useRef<ScreenDirection | null>(null);
  const [direction, setDirection] = useState<ScreenDirection>("forward");

  useEffect(() => {
    function handlePopState() {
      pendingDirectionRef.current = "back";
    }

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    const stack = stackRef.current;
    let nextDirection: ScreenDirection = "forward";

    if (pendingDirectionRef.current) {
      nextDirection = pendingDirectionRef.current;
      pendingDirectionRef.current = null;
    } else {
      const existingIndex = stack.lastIndexOf(pathname);
      if (existingIndex >= 0 && existingIndex < stack.length - 1) {
        nextDirection = "back";
        stackRef.current = stack.slice(0, existingIndex + 1);
      } else if (stack[stack.length - 1] !== pathname) {
        stackRef.current = [...stack, pathname];
      }
    }

    setDirection(nextDirection);
  }, [pathname]);

  const slideFromStart =
    (direction === "forward" && !isRtl) || (direction === "back" && isRtl);
  const slideFromEnd =
    (direction === "forward" && isRtl) || (direction === "back" && !isRtl);

  return (
    <div
      key={pathname}
      data-layout-root="screen-transition"
      className={cn(
        "flex min-h-0 flex-1 flex-col overflow-hidden",
        "motion-safe:animate-in motion-safe:fade-in-0 motion-safe:duration-200",
        slideFromStart && "motion-safe:slide-in-from-left-3",
        slideFromEnd && "motion-safe:slide-in-from-right-3",
        "motion-reduce:animate-none",
      )}
    >
      {children}
    </div>
  );
}
