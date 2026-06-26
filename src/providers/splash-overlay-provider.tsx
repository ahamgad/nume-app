"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface SplashOverlayState {
  active: boolean;
  canStartCurtain: boolean;
  reducedMotion: boolean;
  logoFadeComplete: boolean;
}

interface SplashOverlayContextValue {
  state: SplashOverlayState;
  beginSplash: (options: { reducedMotion: boolean }) => void;
  setCanStartCurtain: (value: boolean) => void;
  setLogoFadeComplete: (value: boolean) => void;
  dismissSplash: () => void;
}

const defaultState: SplashOverlayState = {
  active: false,
  canStartCurtain: false,
  reducedMotion: false,
  logoFadeComplete: false,
};

const SplashOverlayContext = createContext<SplashOverlayContextValue | null>(
  null,
);

export function SplashOverlayProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SplashOverlayState>(defaultState);

  const beginSplash = useCallback((options: { reducedMotion: boolean }) => {
    setState({
      active: true,
      canStartCurtain: false,
      reducedMotion: options.reducedMotion,
      logoFadeComplete: options.reducedMotion,
    });
  }, []);

  const setCanStartCurtain = useCallback((value: boolean) => {
    setState((current) =>
      current.active ? { ...current, canStartCurtain: value } : current,
    );
  }, []);

  const setLogoFadeComplete = useCallback((value: boolean) => {
    setState((current) =>
      current.active ? { ...current, logoFadeComplete: value } : current,
    );
  }, []);

  const dismissSplash = useCallback(() => {
    setState(defaultState);
  }, []);

  const value = useMemo(
    () => ({
      state,
      beginSplash,
      setCanStartCurtain,
      setLogoFadeComplete,
      dismissSplash,
    }),
    [
      beginSplash,
      dismissSplash,
      setCanStartCurtain,
      setLogoFadeComplete,
      state,
    ],
  );

  return (
    <SplashOverlayContext.Provider value={value}>
      {children}
    </SplashOverlayContext.Provider>
  );
}

export function useSplashOverlay() {
  const context = useContext(SplashOverlayContext);
  if (!context) {
    throw new Error("useSplashOverlay must be used within SplashOverlayProvider");
  }
  return context;
}
