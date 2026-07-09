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
import {
  clearPendingVerificationEmail,
  getPendingVerificationEmail,
} from "@/lib/auth/pending-verification-email";
import { resolveSignUpResult } from "@/lib/auth/sign-up-result";
import { markSessionExpiredNotice } from "@/lib/auth/session-notice";
import { getAuthCallbackUrl } from "@/lib/auth/urls";
import { createClient } from "@/lib/supabase/client";
import { hasSupabaseEnv } from "@/lib/supabase/env";

type AuthActionResult = {
  error: AuthErrorCode | null;
  requiresVerification?: boolean;
};

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (
    email: string,
    password: string,
  ) => Promise<AuthActionResult>;
  signUp: (
    email: string,
    password: string,
  ) => Promise<AuthActionResult>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthErrorCode | null }>;
  updatePassword: (password: string) => Promise<{ error: AuthErrorCode | null }>;
  resendVerification: (
    email?: string,
  ) => Promise<{ error: AuthErrorCode | null }>;
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
  if (nextSession?.user?.email_confirmed_at) {
    clearPendingVerificationEmail();
  }
}

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
        clearPendingVerificationEmail();
      }

      applySessionState(nextSession, setSession, setUser);
      setIsLoading(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const signIn = useCallback(
    async (email: string, password: string): Promise<AuthActionResult> => {
      if (!supabase) return { error: "notConfigured" as const };
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        return { error: mapSupabaseAuthError(error) };
      }
      if (data.user && !data.user.email_confirmed_at) {
        return { error: null, requiresVerification: true };
      }
      return { error: null };
    },
    [supabase],
  );

  const signUp = useCallback(
    async (email: string, password: string): Promise<AuthActionResult> => {
      if (!supabase) return { error: "notConfigured" as const };
      const response = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: getAuthCallbackUrl("/email-verified"),
        },
      });
      return resolveSignUpResult(response);
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
        redirectTo: getAuthCallbackUrl("/reset-password"),
      });
      return { error: error ? mapSupabaseAuthError(error) : null };
    },
    [supabase],
  );

  const updatePassword = useCallback(
    async (password: string) => {
      if (!supabase) return { error: "notConfigured" as const };
      const { error } = await supabase.auth.updateUser({ password });
      return { error: error ? mapSupabaseAuthError(error) : null };
    },
    [supabase],
  );

  const resendVerification = useCallback(
    async (email?: string) => {
      if (!supabase) return { error: "notConfigured" as const };
      const targetEmail = email ?? user?.email ?? getPendingVerificationEmail();
      if (!targetEmail) return { error: "noEmail" as const };
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: targetEmail,
        options: {
          emailRedirectTo: getAuthCallbackUrl("/email-verified"),
        },
      });
      return { error: error ? mapSupabaseAuthError(error) : null };
    },
    [supabase, user],
  );

  const refreshSession = useCallback(async (): Promise<User | null> => {
    if (!supabase) return null;
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
