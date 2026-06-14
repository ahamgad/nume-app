"use client";

/**
 * NUME keyboard strategy (Phase 3.5 — frozen before Gold).
 *
 * The keyboard overlays the bottom of the layout viewport naturally.
 * We do NOT resize the app shell or lift fixed CTAs.
 *
 * Consumers use `useKeyboardScroll` for focused-input positioning,
 * temporary spacers, and scroll lock while typing.
 */
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export interface KeyboardState {
  isOpen: boolean;
  keyboardInset: number;
}

const defaultState: KeyboardState = {
  isOpen: false,
  keyboardInset: 0,
};

const KeyboardContext = createContext<KeyboardState>(defaultState);

export function KeyboardProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<KeyboardState>(defaultState);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const viewport = window.visualViewport;
    if (!viewport) return;

    function update() {
      const vv = window.visualViewport;
      if (!vv) {
        setState(defaultState);
        return;
      }

      const overlap = Math.max(
        0,
        Math.round(window.innerHeight - vv.height - vv.offsetTop),
      );
      setState({
        isOpen: overlap > 0,
        keyboardInset: overlap,
      });
    }

    update();
    viewport.addEventListener("resize", update);
    viewport.addEventListener("scroll", update);
    window.addEventListener("orientationchange", update);

    return () => {
      viewport.removeEventListener("resize", update);
      viewport.removeEventListener("scroll", update);
      window.removeEventListener("orientationchange", update);
    };
  }, []);

  return (
    <KeyboardContext.Provider value={state}>{children}</KeyboardContext.Provider>
  );
}

export function useKeyboard(): KeyboardState {
  return useContext(KeyboardContext);
}
