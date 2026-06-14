"use client";

import { useKeyboard } from "@/providers/keyboard-provider";

/**
 * Tracks on-screen keyboard overlap using the shared KeyboardProvider.
 */
export function useVisualViewportInset(enabled = true): number {
  const { keyboardInset } = useKeyboard();
  return enabled ? keyboardInset : 0;
}
