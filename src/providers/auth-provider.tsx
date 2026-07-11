"use client";

import type { Session, User } from "@supabase/supabase-js";
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

import { markSessionExpiredNotice } from "@/lib/auth/session-notice";
import { createClient } from "@/lib/supabase/client";

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function applySessionState(
  nextSession: Session | null,
  setSession: (session: Session | null) => void,
  setUser: (user: User | null) => void,
) {
  setSession(nextSession);
  setUser(nextSession?.user ?? null);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const intentionalSignOutRef = useRef(false);
  const hadAuthenticatedSessionRef = useRef(false);

  useEffect(() => {
    let active = true;

    void supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      if (!active) {
        return;
      }
      if (initialSession?.user) {
        hadAuthenticatedSessionRef.current = true;
      }
      applySessionState(initialSession, setSession, setUser);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (nextSession?.user) {
        hadAuthenticatedSessionRef.current = true;
      }

      if (
        event === "SIGNED_OUT" &&
        hadAuthenticatedSessionRef.current &&
        !intentionalSignOutRef.current
      ) {
        markSessionExpiredNotice();
      }

      if (event === "SIGNED_OUT") {
        hadAuthenticatedSessionRef.current = false;
      }

      applySessionState(nextSession, setSession, setUser);
      setIsLoading(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const signOut = useCallback(async () => {
    intentionalSignOutRef.current = true;
    try {
      await supabase.auth.signOut();
    } finally {
      intentionalSignOutRef.current = false;
    }
  }, [supabase]);

  const refreshSession = useCallback(async (): Promise<User | null> => {
    const { data } = await supabase.auth.refreshSession();
    const nextUser = data.session?.user ?? null;
    applySessionState(data.session, setSession, setUser);
    return nextUser;
  }, [supabase]);

  const value = useMemo(
    () => ({
      user,
      session,
      isLoading,
      signOut,
      refreshSession,
    }),
    [user, session, isLoading, signOut, refreshSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
