"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type ToastTone = "default" | "warning" | "success";
export type ToastIcon = "wifi-off";

export interface ToastOptions {
  id?: string;
  description?: string;
  tone?: ToastTone;
  icon?: ToastIcon;
  persistent?: boolean;
  durationMs?: number;
}

export interface ToastMessage {
  id: string;
  message: string;
  description?: string;
  tone: ToastTone;
  icon?: ToastIcon;
  persistent: boolean;
}

interface ToastContextValue {
  toasts: ToastMessage[];
  showToast: (message: string, options?: ToastOptions) => void;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const timersRef = useRef<Map<string, number>>(new Map());

  const dismissToast = useCallback((id: string) => {
    const timer = timersRef.current.get(id);
    if (timer !== undefined) {
      window.clearTimeout(timer);
      timersRef.current.delete(id);
    }
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, options?: ToastOptions) => {
      const id = options?.id ?? crypto.randomUUID();
      const tone = options?.tone ?? "default";
      const persistent = options?.persistent ?? false;

      const nextToast: ToastMessage = {
        id,
        message,
        description: options?.description,
        tone,
        icon: options?.icon,
        persistent,
      };

      setToasts((prev) => {
        const withoutDuplicate = options?.id
          ? prev.filter((toast) => toast.id !== options.id)
          : prev;
        return [...withoutDuplicate, nextToast];
      });

      const existingTimer = timersRef.current.get(id);
      if (existingTimer !== undefined) {
        window.clearTimeout(existingTimer);
        timersRef.current.delete(id);
      }

      if (!persistent) {
        const durationMs = options?.durationMs ?? 3000;
        const timer = window.setTimeout(() => dismissToast(id), durationMs);
        timersRef.current.set(id, timer);
      }
    },
    [dismissToast],
  );

  const value = useMemo(
    () => ({ toasts, showToast, dismissToast }),
    [toasts, showToast, dismissToast],
  );

  return (
    <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}
