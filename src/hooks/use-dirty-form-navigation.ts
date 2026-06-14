"use client";

import { useCallback } from "react";

/**
 * Dirty form navigation (NUME platform — frozen before Gold).
 *
 * Edge swipe is disabled globally via NavigationEdgeGuard. Dirty forms rely on
 * the header back button to open the discard sheet, then router.back() on confirm.
 */
export function useDirtyFormNavigation() {
  const confirmDiscardNavigation = useCallback((navigateBack: () => void) => {
    navigateBack();
  }, []);

  return { confirmDiscardNavigation };
}
