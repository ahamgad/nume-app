"use client";

import { SplashIntroStrokes } from "@/components/app/splash-intro-strokes";
import { NUME_SPLASH_LOADER_STROKE_WIDTH_PX } from "@/lib/app/splash-stroke-paths";
import { cn } from "@/lib/utils";

interface PullToRefreshIndicatorProps {
  isRefreshing: boolean;
  opacity: number;
  className?: string;
}

export function PullToRefreshIndicator({
  opacity,
  className,
}: PullToRefreshIndicatorProps) {
  return (
    <div
      aria-hidden
      className={cn("nume-refresh-indicator", className)}
      style={{ opacity }}
    >
      <SplashIntroStrokes
        size={24}
        strokeWidth={NUME_SPLASH_LOADER_STROKE_WIDTH_PX}
      />
    </div>
  );
}
