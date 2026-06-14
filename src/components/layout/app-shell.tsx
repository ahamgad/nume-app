"use client";

import type { ReactNode } from "react";

import { TabBar } from "@/components/layout/tab-bar";
import { ToastViewport } from "@/components/ui/toast-viewport";
import { useVisualViewportHeight } from "@/hooks/use-visual-viewport-height";

export function AppShell({ children }: { children: ReactNode }) {
  const viewportHeight = useVisualViewportHeight();

  return (
    <div
      className="mx-auto flex h-dvh min-h-0 w-full min-w-0 max-w-lg flex-col overflow-hidden bg-background text-foreground"
      style={
        viewportHeight !== null
          ? { height: viewportHeight, maxHeight: viewportHeight }
          : undefined
      }
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {children}
      </div>
      <TabBar />
      <ToastViewport />
    </div>
  );
}
