"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { isSupportedApplicationRuntime } from "@/lib/device/pwa-standalone";
import { DISTRIBUTION_PATH, isApplicationRoute } from "@/lib/navigation/runtime-routes";

export function InstallGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const blocked =
    isApplicationRoute(pathname) && !isSupportedApplicationRuntime();

  useEffect(() => {
    if (!blocked) return;
    router.replace(DISTRIBUTION_PATH);
  }, [blocked, router]);

  if (blocked) {
    return null;
  }

  return children;
}
