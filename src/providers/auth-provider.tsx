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

import { mapSupabaseAuthError, type AuthErrorCode } from "@/lib/auth/errors";
import { markSessionExpiredNotice } from "@/lib/auth/session-notice";
import { createClient } from "@/lib/supabase/client";
import { getAppUrl, hasSupabaseEnv } from "@/lib/supabase/env";

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ error: AuthErrorCode | null }>;
  signUp: (
    email: string,
    password: string,
  ) => Promise<{ error: AuthErrorCode | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthErrorCode | null }>;
  updatePassword: (password: string) => Promise<{ error: AuthErrorCode | null }>;
  resendVerification: () => Promise<{ error: AuthErrorCode | null }>;
  refreshSession: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = useMemo(
    () => (hasSupabaseEnv() ? createClient() : null),
    [],
  );
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(() => hasSupabaseEnv());
  const intentionalSignOutRef = useRef(false);
  const hadAuthenticatedSessionRef = useRef(false);

  useEffect(() => {
    if (!supabase) {
      return;
    }

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

      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      if (!supabase) return { error: "notConfigured" as const };
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error: error ? mapSupabaseAuthError(error.message) : null };
    },
    [supabase],
  );

  const signUp = useCallback(
    async (email: string, password: string) => {
      if (!supabase) return { error: "notConfigured" as const };
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${getAppUrl()}/auth/callback?next=/verify-email`,
        },
      });
      return { error: error ? mapSupabaseAuthError(error.message) : null };
    },
    [supabase],
  );

  const signOut = useCallback(async () => {
    if (!supabase) return;
    intentionalSignOutRef.current = true;
    try {
      await supabase.auth.signOut();
    } finally {
      intentionalSignOutRef.current = false;
    }
  }, [supabase]);

  const resetPassword = useCallback(
    async (email: string) => {
      if (!supabase) return { error: "notConfigured" as const };
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${getAppUrl()}/auth/callback?next=/reset-password`,
      });
      return { error: error ? mapSupabaseAuthError(error.message) : null };
    },
    [supabase],
  );

  const updatePassword = useCallback(
    async (password: string) => {
      if (!supabase) return { error: "notConfigured" as const };
      const { error } = await supabase.auth.updateUser({ password });
      return { error: error ? mapSupabaseAuthError(error.message) : null };
    },
    [supabase],
  );

  const resendVerification = useCallback(async () => {
    if (!supabase) return { error: "notConfigured" as const };
    if (!user?.email) return { error: "noEmail" as const };
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: user.email,
      options: {
        emailRedirectTo: `${getAppUrl()}/auth/callback?next=/verify-email`,
      },
    });
    return { error: error ? mapSupabaseAuthError(error.message) : null };
  }, [supabase, user]);

  const refreshSession = useCallback(async (): Promise<User | null> => {
    if (!supabase) return null;
    const { data } = await supabase.auth.refreshSession();
    const nextUser = data.session?.user ?? null;
    setSession(data.session);
    setUser(nextUser);
    return nextUser;
  }, [supabase]);

  const value = useMemo(
    () => ({
      user,
      session,
      isLoading,
      signIn,
      signUp,
      signOut,
      resetPassword,
      updatePassword,
      resendVerification,
      refreshSession,
    }),
    [
      user,
      session,
      isLoading,
      signIn,
      signUp,
      signOut,
      resetPassword,
      updatePassword,
      resendVerification,
      refreshSession,
    ],
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
