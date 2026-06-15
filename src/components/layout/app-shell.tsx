"use client";

import type { ReactNode } from "react";

import { TabBar } from "@/components/layout/tab-bar";
import { ToastViewport } from "@/components/ui/toast-viewport";
import { useDocumentScrollGuard } from "@/hooks/use-document-scroll-guard";
import {
  getAppShellHeightClass,
  KEYBOARD_SNAP_EXPERIMENT_B_DISABLE_SCROLL_GUARD,
} from "@/lib/layout/keyboard-snap-investigation";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: ReactNode }) {
  useDocumentScrollGuard(!KEYBOARD_SNAP_EXPERIMENT_B_DISABLE_SCROLL_GUARD);

  return (
    <div
      className={cn(
        "mx-auto flex w-full min-w-0 max-w-lg flex-col overflow-hidden bg-background text-foreground",
        getAppShellHeightClass(),
      )}
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {children}
      </div>
      <TabBar />
      <ToastViewport />
    </div>
  );
}
