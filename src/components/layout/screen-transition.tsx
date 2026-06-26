"use client";

import { usePathname } from "next/navigation";
import { type ReactNode, useEffect, useRef, useState } from "react";

import { ScreenTitleCollapseProvider } from "@/components/layout/screen-title-collapse";
import { consumeSplashHandoff } from "@/lib/app/splash-session";
import { numeMotionSafeScreenEnterClass } from "@/lib/layout/motion";
import { cn } from "@/lib/utils";

export function ScreenTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const previousPathnameRef = useRef<string | null>(null);
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    const fromPathname = previousPathnameRef.current;
    const skipForSplashHandoff =
      pathname === "/" && fromPathname === "/splash" && consumeSplashHandoff();
    setShouldAnimate(
      !skipForSplashHandoff &&
        fromPathname !== null &&
        fromPathname !== pathname,
    );
    previousPathnameRef.current = pathname;
  }, [pathname]);

  return (
    <ScreenTitleCollapseProvider key={pathname}>
      <div
        data-layout-root="screen-transition"
        className={cn(
          "flex min-h-0 flex-1 flex-col overflow-hidden",
          shouldAnimate && numeMotionSafeScreenEnterClass(),
          "motion-reduce:animate-none",
        )}
      >
        {children}
      </div>
    </ScreenTitleCollapseProvider>
  );
}
