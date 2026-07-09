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

import {
  mapSupabaseAuthError,
  type MappedAuthError,
} from "@/lib/auth/errors";
import {
  clearPendingVerificationEmail,
  getPendingVerificationEmail,
} from "@/lib/auth/pending-verification-email";
import { resolveSignUpResult } from "@/lib/auth/sign-up-result";
import { markSessionExpiredNotice } from "@/lib/auth/session-notice";
import { getAuthCallbackUrl } from "@/lib/auth/urls";
import { createClient } from "@/lib/supabase/client";

type AuthActionResult = {
  error: MappedAuthError | null;
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
  resetPassword: (email: string) => Promise<{ error: MappedAuthError | null }>;
  updatePassword: (
    password: string,
  ) => Promise<{ error: MappedAuthError | null }>;
  resendVerification: (
    email?: string,
  ) => Promise<{ error: MappedAuthError | null }>;
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
  // Fail fast on missing Supabase env — configuration error, not an auth error.
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

  const signIn = useCallback(
    async (email: string, password: string): Promise<AuthActionResult> => {
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
      const response = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: getAuthCallbackUrl("/splash"),
        },
      });
      return resolveSignUpResult(response);
    },
    [supabase],
  );

  const signOut = useCallback(async () => {
    intentionalSignOutRef.current = true;
    try {
      await supabase.auth.signOut();
    } finally {
      intentionalSignOutRef.current = false;
    }
  }, [supabase]);

  const resetPassword = useCallback(
    async (email: string) => {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: getAuthCallbackUrl("/reset-password"),
      });
      return { error: error ? mapSupabaseAuthError(error) : null };
    },
    [supabase],
  );

  const updatePassword = useCallback(
    async (password: string) => {
      const { error } = await supabase.auth.updateUser({ password });
      return { error: error ? mapSupabaseAuthError(error) : null };
    },
    [supabase],
  );

  const resendVerification = useCallback(
    async (email?: string) => {
      const targetEmail = email ?? user?.email ?? getPendingVerificationEmail();
      if (!targetEmail) {
        throw new Error(
          "Internal state error: verification resend requested without an email",
        );
      }
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: targetEmail,
        options: {
          emailRedirectTo: getAuthCallbackUrl("/splash"),
        },
      });
      return { error: error ? mapSupabaseAuthError(error) : null };
    },
    [supabase, user],
  );

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
