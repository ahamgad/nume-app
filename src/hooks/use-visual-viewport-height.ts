"use client";

import { useKeyboard } from "@/providers/keyboard-provider";

/**
 * Binds layout height to the visible viewport via the shared KeyboardProvider.
 */
export function useVisualViewportHeight(enabled = true): number | null {
  const { viewportHeight } = useKeyboard();
  return enabled ? viewportHeight : null;
}
