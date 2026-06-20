"use client";

import { usePathname } from "next/navigation";
import { type ReactNode, useEffect, useRef, useState } from "react";

import { numeMotionSafeScreenEnterClass } from "@/lib/layout/motion";
import { cn } from "@/lib/utils";

export function ScreenTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const previousPathnameRef = useRef<string | null>(null);
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    const fromPathname = previousPathnameRef.current;
    setShouldAnimate(fromPathname !== null && fromPathname !== pathname);
    previousPathnameRef.current = pathname;
  }, [pathname]);

  return (
    <div
      key={pathname}
      data-layout-root="screen-transition"
      className={cn(
        "flex min-h-0 flex-1 flex-col overflow-hidden",
        shouldAnimate && numeMotionSafeScreenEnterClass(),
        "motion-reduce:animate-none",
      )}
    >
      {children}
    </div>
  );
}
