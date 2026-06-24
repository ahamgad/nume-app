import type { CSSProperties } from "react";

import { NUME_MOTION_EASE } from "@/lib/layout/motion";

/** Maximum visual pull distance (px) — shared by PTR hook and visual compensation. */
export const PULL_TO_REFRESH_MAX_VISUAL_OFFSET_PX = 88;

/** Snap-back duration (ms) — matches `usePullToRefresh` presentation timing. */
export const PULL_TO_REFRESH_SNAP_BACK_MS = 280;

/** Counter-transform for surfaces that must stay flush with the fixed header during PTR. */
export function pullToRefreshCounterTransformStyle(
  offset: number,
  isAnimating: boolean,
): CSSProperties | undefined {
  if (offset <= 0 && !isAnimating) return undefined;

  return {
    transform: `translate3d(0, ${-offset}px, 0)`,
    transition: isAnimating
      ? `transform ${PULL_TO_REFRESH_SNAP_BACK_MS}ms ${NUME_MOTION_EASE}`
      : undefined,
  };
}
