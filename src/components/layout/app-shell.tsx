"use client";

import { useRef, type ReactNode } from "react";

import { InstitutionBrandAssetPool } from "@/components/institutions/institution-brand-asset-pool";
import { TabBar } from "@/components/layout/tab-bar";
import { ToastViewport } from "@/components/ui/toast-viewport";
import { useDocumentScrollGuard } from "@/hooks/use-document-scroll-guard";
import { useLayoutShiftDiagnostics } from "@/hooks/use-layout-shift-diagnostics";
import {
  getAppShellHeightClass,
  KEYBOARD_SNAP_EXPERIMENT_B_DISABLE_SCROLL_GUARD,
} from "@/lib/layout/keyboard-snap-investigation";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useDocumentScrollGuard(!KEYBOARD_SNAP_EXPERIMENT_B_DISABLE_SCROLL_GUARD);
  useLayoutShiftDiagnostics(rootRef);

  return (
    <div
      ref={rootRef}
      data-layout-root="app-shell"
      className={cn(
        "mx-auto flex w-full min-w-0 max-w-lg flex-col overflow-hidden bg-background text-foreground",
        getAppShellHeightClass(),
      )}
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {children}
      </div>
      <InstitutionBrandAssetPool />
      <TabBar />
      <ToastViewport />
    </div>
  );
}
