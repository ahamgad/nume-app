"use client";

import { usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { isSplashComplete } from "@/lib/app/splash-session";
import { useColdResumeSplash } from "@/hooks/use-cold-resume-splash";

/**
 * Redirects cold app entry to the official splash before dashboard.
 * Splash always lands on `/` (dashboard) — never the previous route.
 */
export function AppBootstrap({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  useColdResumeSplash();

  useEffect(() => {
    if (pathname === "/splash") return;
    if (isSplashComplete()) return;
    window.location.replace("/splash");
  }, [pathname]);

  return children;
}
