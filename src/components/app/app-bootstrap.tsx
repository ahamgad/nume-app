"use client";

import { usePathname } from "next/navigation";
import { useSyncExternalStore, type ReactNode } from "react";

import { isAuthRoute, isSplashComplete } from "@/lib/app/splash-session";
import { isDistributionRoute } from "@/lib/navigation/runtime-routes";

function subscribeSplashGate(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener("pageshow", onStoreChange);
  window.addEventListener("nume-splash-gate", onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener("pageshow", onStoreChange);
    window.removeEventListener("nume-splash-gate", onStoreChange);
  };
}

function getSplashGateSnapshot(pathname: string) {
  if (pathname === "/splash") return true;
  if (isDistributionRoute(pathname)) return true;
  if (isAuthRoute(pathname)) return true;
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
