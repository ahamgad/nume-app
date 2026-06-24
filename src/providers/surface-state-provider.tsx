"use client";

import { createContext, useContext, type ReactNode } from "react";

import type { SurfaceState } from "@/lib/layout/surface-state-chrome";

const SurfaceStateContext = createContext<SurfaceState>("canvas");

export function SurfaceStateProvider({
  value,
  children,
}: {
  value: SurfaceState;
  children: ReactNode;
}) {
  return (
    <SurfaceStateContext.Provider value={value}>
      {children}
    </SurfaceStateContext.Provider>
  );
}

/** Current surface for accent chrome — defaults to canvas (app / sheet background). */
export function useSurfaceState(): SurfaceState {
  return useContext(SurfaceStateContext);
}
