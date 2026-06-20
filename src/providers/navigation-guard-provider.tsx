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
import { isTabRootPath } from "@/lib/navigation/tab-roots";

interface NavigationGuardRegistration {
  isDirty: boolean;
}

interface NavigationGuardContextValue {
  register: (registration: NavigationGuardRegistration) => () => void;
  notifyDirtyChange: () => void;
  requestBack: (navigateBack?: () => void) => void;
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

export function NavigationGuardProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [showDiscard, setShowDiscard] = useState(false);
  const [guardRevision, setGuardRevision] = useState(0);
  const registrationsRef = useRef<Set<NavigationGuardRegistration>>(new Set());
  const pendingNavigateRef = useRef<(() => void) | null>(null);
  const allowNavigationRef = useRef(false);
  const historyTrapActiveRef = useRef(false);

  const notifyDirtyChange = useCallback(() => {
    setGuardRevision((revision) => revision + 1);
  }, []);

  const register = useCallback((registration: NavigationGuardRegistration) => {
    registrationsRef.current.add(registration);
    return () => {
      registrationsRef.current.delete(registration);
      setGuardRevision((revision) => revision + 1);
    };
  }, []);

  const navigateAway = useCallback(() => {
    const pending = pendingNavigateRef.current;
    pendingNavigateRef.current = null;
    allowNavigationRef.current = true;

    if (historyTrapActiveRef.current) {
      historyTrapActiveRef.current = false;
      window.history.go(-2);
      return;
    }

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

      router.back();
    },
    [router],
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    function pushHistoryTrap() {
      window.history.pushState({ numeNavigationGuard: true }, "", window.location.href);
      historyTrapActiveRef.current = true;
    }

    function handlePopState() {
      if (allowNavigationRef.current) {
        allowNavigationRef.current = false;
        return;
      }

      const dirty = readIsDirty(registrationsRef.current);

      if (isTabRootPath(pathname)) {
        pushHistoryTrap();
        return;
      }

      if (dirty) {
        pendingNavigateRef.current = null;
        setShowDiscard(true);
        pushHistoryTrap();
      }
    }

    const dirty = readIsDirty(registrationsRef.current);

    if (isTabRootPath(pathname) || dirty) {
      pushHistoryTrap();
    }

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [pathname, guardRevision, router]);

  const handleDiscardConfirm = useCallback(() => {
    setShowDiscard(false);
    navigateAway();
  }, [navigateAway]);

  const handleDiscardCancel = useCallback(() => {
    pendingNavigateRef.current = null;
    setShowDiscard(false);
  }, []);

  const value = useMemo(
    () => ({ register, notifyDirtyChange, requestBack }),
    [register, notifyDirtyChange, requestBack],
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
