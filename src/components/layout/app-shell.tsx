"use client";

import type { ReactNode } from "react";

import { TabBar } from "@/components/layout/tab-bar";
import { ToastViewport } from "@/components/ui/toast-viewport";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex h-dvh min-h-0 w-full min-w-0 max-w-lg flex-col overflow-hidden bg-background text-foreground">
      {children}
      <TabBar />
      <ToastViewport />
    </div>
  );
}
