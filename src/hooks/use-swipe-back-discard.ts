"use client";

import { useCallback, useEffect, useRef } from "react";

interface UseSwipeBackDiscardOptions {
  isDirty: boolean;
  onRequestDiscard: () => void;
  enabled?: boolean;
}

/**
 * Intercepts iOS swipe-back before Next.js navigates away.
 *
 * Root cause of transition flash: popstate fires after the browser starts
 * history traversal. We push a guard entry while dirty and re-push on
 * popstate (capture phase) before paint so the URL never leaves the form.
 */
export function useSwipeBackDiscard({
  isDirty,
  onRequestDiscard,
  enabled = true,
}: UseSwipeBackDiscardOptions) {
  const bypassRef = useRef(false);
  const onRequestDiscardRef = useRef(onRequestDiscard);

  useEffect(() => {
    onRequestDiscardRef.current = onRequestDiscard;
  }, [onRequestDiscard]);

  useEffect(() => {
    if (!enabled || !isDirty) return;

    bypassRef.current = false;
    const url = window.location.pathname + window.location.search;
    window.history.pushState({ numeDiscardGuard: true }, "", url);

    function handlePopState() {
      if (bypassRef.current) return;
      window.history.pushState({ numeDiscardGuard: true }, "", url);
      onRequestDiscardRef.current();
    }

    window.addEventListener("popstate", handlePopState, { capture: true });
    return () => {
      window.removeEventListener("popstate", handlePopState, { capture: true });
      if (!bypassRef.current && window.history.state?.numeDiscardGuard) {
        bypassRef.current = true;
        window.history.back();
      }
    };
  }, [enabled, isDirty]);

  /** Call before router.back() when the user confirms discarding changes. */
  const confirmDiscardNavigation = useCallback((navigateBack: () => void) => {
    bypassRef.current = true;
    if (window.history.state?.numeDiscardGuard) {
      window.history.back();
    }
    navigateBack();
  }, []);

  return { confirmDiscardNavigation };
};
