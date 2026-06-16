"use client";

import { cn } from "@/lib/utils";

interface PullToRefreshIndicatorProps {
  isRefreshing: boolean;
  opacity: number;
  className?: string;
}

export function PullToRefreshIndicator({
  isRefreshing,
  opacity,
  className,
}: PullToRefreshIndicatorProps) {
  return (
    <div
      aria-hidden
      className={cn(
        "nume-refresh-indicator",
        isRefreshing && "nume-refresh-indicator-active",
        className,
      )}
      style={{ opacity }}
    >
      <svg viewBox="0 0 24 24" className="size-6" aria-hidden>
        <circle
          cx="12"
          cy="12"
          r="9"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          className="nume-refresh-indicator-track"
        />
        <circle
          cx="12"
          cy="12"
          r="9"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          pathLength="100"
          className="nume-refresh-indicator-arc"
        />
      </svg>
    </div>
  );
}
