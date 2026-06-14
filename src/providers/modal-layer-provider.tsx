"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface ModalLayerContextValue {
  isModalOpen: boolean;
  registerModal: () => () => void;
}

const ModalLayerContext = createContext<ModalLayerContextValue>({
  isModalOpen: false,
  registerModal: () => () => {},
});

export function ModalLayerProvider({ children }: { children: ReactNode }) {
  const [count, setCount] = useState(0);

  const registerModal = useCallback(() => {
    setCount((current) => current + 1);
    return () => setCount((current) => Math.max(0, current - 1));
  }, []);

  const isModalOpen = count > 0;

  useEffect(() => {
    const html = document.documentElement;
    if (isModalOpen) {
      html.dataset.modalOpen = "true";
    } else {
      delete html.dataset.modalOpen;
    }
  }, [isModalOpen]);

  const value = useMemo(
    () => ({ isModalOpen, registerModal }),
    [isModalOpen, registerModal],
  );

  return (
    <ModalLayerContext.Provider value={value}>
      {children}
    </ModalLayerContext.Provider>
  );
}

export function useModalLayer() {
  return useContext(ModalLayerContext);
}

/** Registers a modal layer while `active` is true (e.g. bottom sheet open). */
export function useModalLayerLock(active: boolean) {
  const { registerModal } = useModalLayer();

  useEffect(() => {
    if (!active) return;
    return registerModal();
  }, [active, registerModal]);
}
