"use client";

import { usePathname } from "next/navigation";
import { type ReactNode, useEffect, useRef, useState } from "react";

import { numeMotionSafeScreenEnterClass } from "@/lib/layout/motion";
import { useLocale } from "@/providers/i18n-provider";
import { cn } from "@/lib/utils";

type ScreenDirection = "forward" | "back";

export function ScreenTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const locale = useLocale();
  const isRtl = locale === "ar";
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
    let nextDirection: ScreenDirection = "forward";

    if (pendingDirectionRef.current) {
      nextDirection = pendingDirectionRef.current;
      pendingDirectionRef.current = null;
    }

    setDirection(nextDirection);
  }, [pathname]);

  // NUME stack navigation direction:
  // - Forward (parent → child): enter from end (right in LTR, left in RTL)
  // - Back (child → parent): enter from start (left in LTR, right in RTL)
  const enterFromStart =
    (direction === "back" && !isRtl) || (direction === "forward" && isRtl);

  return (
    <div
      key={pathname}
      data-layout-root="screen-transition"
      className={cn(
        "flex min-h-0 flex-1 flex-col overflow-hidden",
        numeMotionSafeScreenEnterClass(enterFromStart),
        "motion-reduce:animate-none",
      )}
    >
      {children}
    </div>
  );
}
