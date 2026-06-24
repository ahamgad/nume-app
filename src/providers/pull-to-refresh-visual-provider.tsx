"use client";

import { createContext, useContext, type ReactNode } from "react";

interface PullToRefreshVisualContextValue {
  offset: number;
  isAnimating: boolean;
}

const PullToRefreshVisualContext = createContext<PullToRefreshVisualContextValue>({
  offset: 0,
  isAnimating: false,
});

export function PullToRefreshVisualProvider({
  offset,
  isAnimating,
  children,
}: PullToRefreshVisualContextValue & { children: ReactNode }) {
  return (
    <PullToRefreshVisualContext.Provider value={{ offset, isAnimating }}>
      {children}
    </PullToRefreshVisualContext.Provider>
  );
}

/** Presentation-only PTR offset for counter-transform surfaces. */
export function usePullToRefreshVisual(): PullToRefreshVisualContextValue {
  return useContext(PullToRefreshVisualContext);
}
