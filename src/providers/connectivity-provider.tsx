"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import {
  readBrowserOnline,
  subscribeToConnectivity,
} from "@/lib/connectivity/connectivity-state";

interface ConnectivityContextValue {
  isOnline: boolean;
  /** Ensures the persistent offline toast is shown (e.g. pull-to-refresh while offline). */
  signalOffline: () => void;
  registerOfflineSignaler: (handler: () => void) => () => void;
}

const ConnectivityContext = createContext<ConnectivityContextValue | null>(null);

export function ConnectivityProvider({ children }: { children: ReactNode }) {
  const isOnline = useSyncExternalStore(
    subscribeToConnectivity,
    readBrowserOnline,
    () => true,
  );

  const signalersRef = useMemo(
    () => ({
      current: new Set<() => void>(),
    }),
    [],
  );

  const registerOfflineSignaler = useCallback((handler: () => void) => {
    signalersRef.current.add(handler);
    return () => {
      signalersRef.current.delete(handler);
    };
  }, [signalersRef]);

  const signalOffline = useCallback(() => {
    signalersRef.current.forEach((handler) => handler());
  }, [signalersRef]);

  const value = useMemo(
    () => ({ isOnline, signalOffline, registerOfflineSignaler }),
    [isOnline, signalOffline, registerOfflineSignaler],
  );

  return (
    <ConnectivityContext.Provider value={value}>
      {children}
    </ConnectivityContext.Provider>
  );
}

export function useConnectivity() {
  const context = useContext(ConnectivityContext);
  if (!context) {
    throw new Error("useConnectivity must be used within ConnectivityProvider");
  }
  return context;
}
