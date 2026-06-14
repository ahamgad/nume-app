"use client";

import { usePathname } from "next/navigation";
import { useSyncExternalStore, type ReactNode } from "react";

import { isSplashComplete } from "@/lib/app/splash-session";
import { useColdResumeSplash } from "@/hooks/use-cold-resume-splash";

function subscribeSplashGate(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener("pageshow", onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener("pageshow", onStoreChange);
  };
}

function getSplashGateSnapshot(pathname: string) {
  if (pathname === "/splash") return true;
  return isSplashComplete();
}

function getSplashGateServerSnapshot() {
  return false;
}

/**
 * True bootstrap gate: app routes do not render until splash completes.
 * Inline script in root layout prevents the first paint flash.
 */
export function AppBootstrap({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  useColdResumeSplash();

  const splashReady = useSyncExternalStore(
    subscribeSplashGate,
    () => getSplashGateSnapshot(pathname),
    getSplashGateServerSnapshot,
  );

  if (!splashReady && pathname !== "/splash") {
    return null;
  }

  return children;
}
