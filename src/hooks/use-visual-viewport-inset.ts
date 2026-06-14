"use client";

import { useKeyboard } from "@/providers/keyboard-provider";

export function useVisualViewportInset(enabled = true): number {
  const { keyboardInset } = useKeyboard();
  return enabled ? keyboardInset : 0;
}
