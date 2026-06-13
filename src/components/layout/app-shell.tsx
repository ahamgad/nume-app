"use client";

import type { ReactNode } from "react";

import { TabBar } from "@/components/layout/tab-bar";
import { ToastViewport } from "@/components/ui/toast-viewport";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex min-h-dvh w-full min-w-0 max-w-lg flex-col bg-background text-foreground">
      {children}
      <TabBar />
      <ToastViewport />
    </div>
  );
}
