"use client";

/**
 * Shared keyboard strategy (NUME platform — frozen before Gold).
 *
 * Root cause: iOS keeps `position: fixed` UI anchored to the layout viewport.
 * Shrinking AppShell height alone does not lift StickyFooter or resize bottom sheets.
 *
 * Strategy:
 * 1. Single visualViewport listener publishes inset + visible rect.
 * 2. StickyFooter uses dynamic `bottom: keyboardInset`.
 * 3. ScreenBody adds keyboard padding + scrolls focused inputs into view.
 * 4. BottomSheet anchors its overlay to the visual viewport rect.
 */
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export interface KeyboardState {
  /** Pixels the on-screen keyboard overlaps the layout viewport. */
  keyboardInset: number;
  /** Visible viewport height (`visualViewport.height`). */
  viewportHeight: number | null;
  /** Visible viewport offset from layout top (`visualViewport.offsetTop`). */
  viewportOffsetTop: number;
}

const defaultState: KeyboardState = {
  keyboardInset: 0,
  viewportHeight: null,
  viewportOffsetTop: 0,
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

      const overlap = window.innerHeight - vv.height - vv.offsetTop;
      setState({
        keyboardInset: Math.max(0, Math.round(overlap)),
        viewportHeight: vv.height,
        viewportOffsetTop: vv.offsetTop,
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
