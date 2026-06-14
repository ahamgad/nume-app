"use client";

import { useCallback, useEffect, useRef } from "react";

interface UseSwipeBackDiscardOptions {
  isDirty: boolean;
  onRequestDiscard: () => void;
  enabled?: boolean;
}

/**
 * Intercepts iOS swipe-back (popstate) so unsaved forms show the same discard
 * dialog as the header back button.
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

    window.history.pushState({ numeDiscardGuard: true }, "");

    function handlePopState() {
      if (bypassRef.current) return;
      window.history.pushState({ numeDiscardGuard: true }, "");
      onRequestDiscardRef.current();
    }

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
      if (!bypassRef.current && window.history.state?.numeDiscardGuard) {
        bypassRef.current = true;
        window.history.back();
      }
    };
  }, [enabled, isDirty]);

  const allowNavigation = useCallback(() => {
    bypassRef.current = true;
    if (window.history.state?.numeDiscardGuard) {
      window.history.back();
    }
  }, []);

  return { allowNavigation };
}
