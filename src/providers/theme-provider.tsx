"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  applyThemePreference,
  readStoredTheme,
  reapplyStoredThemePreference,
  THEME_STORAGE_KEY,
  type ThemePreference,
} from "@/lib/theme/theme-preference";

interface ThemeContextValue {
  theme: ThemePreference;
  setTheme: (theme: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const EDGE_SWIPE_REAPPLY_PX = 24;

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemePreference>(() => readStoredTheme());

  useEffect(() => {
    applyThemePreference(theme);
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  useLayoutEffect(() => {
    function handleNavigationThemeSync() {
      reapplyStoredThemePreference();
    }

    function handlePageShow(event: PageTransitionEvent) {
      reapplyStoredThemePreference();
      if (event.persisted) {
        requestAnimationFrame(reapplyStoredThemePreference);
      }
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        reapplyStoredThemePreference();
      }
    }

    function handleEdgeSwipeThemePriming(event: TouchEvent) {
      const touch = event.touches[0];
      if (!touch) return;

      const fromLeftEdge = touch.clientX <= EDGE_SWIPE_REAPPLY_PX;
      const fromRightEdge =
        touch.clientX >= window.innerWidth - EDGE_SWIPE_REAPPLY_PX;

      if (fromLeftEdge || fromRightEdge) {
        reapplyStoredThemePreference();
      }
    }

    window.addEventListener("pageshow", handlePageShow);
    window.addEventListener("pagehide", handleNavigationThemeSync);
    window.addEventListener("popstate", handleNavigationThemeSync);
    window.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("touchstart", handleEdgeSwipeThemePriming, {
      capture: true,
      passive: true,
    });

    return () => {
      window.removeEventListener("pageshow", handlePageShow);
      window.removeEventListener("pagehide", handleNavigationThemeSync);
      window.removeEventListener("popstate", handleNavigationThemeSync);
      window.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("touchstart", handleEdgeSwipeThemePriming, true);
    };
  }, []);

  useEffect(() => {
    if (theme !== "system") return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => applyThemePreference("system");

    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, [theme]);

  const setTheme = useCallback((next: ThemePreference) => {
    applyThemePreference(next);
    window.localStorage.setItem(THEME_STORAGE_KEY, next);
    setThemeState(next);
  }, []);

  const value = useMemo(() => ({ theme, setTheme }), [theme, setTheme]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
