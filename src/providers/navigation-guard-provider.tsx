"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { DiscardDialog } from "@/components/ui/discard-dialog";

interface NavigationGuardRegistration {
  isDirty: boolean;
}

interface NavigationGuardContextValue {
  register: (registration: NavigationGuardRegistration) => () => void;
  notifyDirtyChange: () => void;
  requestBack: (navigateBack?: () => void) => void;
  isNavigationDirty: boolean;
}

const NavigationGuardContext = createContext<NavigationGuardContextValue | null>(
  null,
);

function useNavigationGuardContext() {
  const context = useContext(NavigationGuardContext);
  if (!context) {
    throw new Error("useNavigationGuard must be used within NavigationGuardProvider");
  }
  return context;
}

function readIsDirty(registrations: Set<NavigationGuardRegistration>) {
  return Array.from(registrations).some((registration) => registration.isDirty);
}

export function useIsNavigationDirty() {
  const context = useContext(NavigationGuardContext);
  return context?.isNavigationDirty ?? false;
}

export function NavigationGuardProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [showDiscard, setShowDiscard] = useState(false);
  const [isNavigationDirty, setIsNavigationDirty] = useState(false);
  const registrationsRef = useRef<Set<NavigationGuardRegistration>>(new Set());
  const pendingNavigateRef = useRef<(() => void) | null>(null);
  const allowNavigationRef = useRef(false);

  const syncDirtyState = useCallback(() => {
    setIsNavigationDirty(readIsDirty(registrationsRef.current));
  }, []);

  const notifyDirtyChange = useCallback(() => {
    syncDirtyState();
  }, [syncDirtyState]);

  const register = useCallback(
    (registration: NavigationGuardRegistration) => {
      registrationsRef.current.add(registration);
      syncDirtyState();
      return () => {
        registrationsRef.current.delete(registration);
        syncDirtyState();
      };
    },
    [syncDirtyState],
  );

  const navigateAway = useCallback(() => {
    const pending = pendingNavigateRef.current;
    pendingNavigateRef.current = null;
    allowNavigationRef.current = true;

    if (pending) {
      pending();
      return;
    }

    router.back();
  }, [router]);

  const requestBack = useCallback(
    (navigateBack?: () => void) => {
      const dirty = readIsDirty(registrationsRef.current);

      if (dirty) {
        pendingNavigateRef.current = navigateBack ?? (() => router.back());
        setShowDiscard(true);
        return;
      }

      if (navigateBack) {
        navigateBack();
        return;
      }

      allowNavigationRef.current = true;
      router.back();
    },
    [router],
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    function handlePopState() {
      if (allowNavigationRef.current) {
        allowNavigationRef.current = false;
        return;
      }

      const dirty = readIsDirty(registrationsRef.current);

      if (dirty) {
        window.history.forward();
        pendingNavigateRef.current = () => {
          allowNavigationRef.current = true;
          router.back();
        };
        setShowDiscard(true);
        return;
      }
    }

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [pathname, isNavigationDirty, router]);

  const handleDiscardConfirm = useCallback(() => {
    setShowDiscard(false);
    navigateAway();
  }, [navigateAway]);

  const handleDiscardCancel = useCallback(() => {
    pendingNavigateRef.current = null;
    setShowDiscard(false);
  }, []);

  const value = useMemo(
    () => ({
      register,
      notifyDirtyChange,
      requestBack,
      isNavigationDirty,
    }),
    [register, notifyDirtyChange, requestBack, isNavigationDirty],
  );

  return (
    <NavigationGuardContext.Provider value={value}>
      {children}
      <DiscardDialog
        open={showDiscard}
        onConfirm={handleDiscardConfirm}
        onCancel={handleDiscardCancel}
      />
    </NavigationGuardContext.Provider>
  );
}

export function useNavigationGuard(isDirty: boolean) {
  const { register, notifyDirtyChange, requestBack } = useNavigationGuardContext();
  const registrationRef = useRef<NavigationGuardRegistration>({ isDirty: false });

  useEffect(() => {
    return register(registrationRef.current);
  }, [register]);

  useEffect(() => {
    registrationRef.current.isDirty = isDirty;
    notifyDirtyChange();
  }, [isDirty, notifyDirtyChange]);

  const handleBack = useCallback(() => {
    requestBack();
  }, [requestBack]);

  return { handleBack, requestBack };
}
