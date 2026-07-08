"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { AuthPasswordField } from "@/components/forms/auth-password-field";
import {
  AuthCard,
  AUTH_PRIMARY_CTA_TOP_CLASS,
  AuthFooterLink,
  AuthLayout,
} from "@/components/layout/auth-layout";
import { consumeSessionExpiredNotice } from "@/lib/auth/session-notice";
import { useAuthErrorMessage } from "@/lib/auth/use-auth-error-message";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useT } from "@/providers/i18n-provider";
import { useAuth } from "@/providers/auth-provider";

export function LoginScreen() {
  const t = useT();
  const router = useRouter();
  const searchParams = useSearchParams();
  const authErrorMessage = useAuthErrorMessage();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (searchParams.get("password_updated") === "1") {
      queueMicrotask(() => setNotice(t("auth.reset.success")));
      return;
    }

    if (searchParams.get("error") === "auth_callback") {
      queueMicrotask(() => setError(t("auth.errors.callbackFailed")));
      return;
    }

    if (consumeSessionExpiredNotice()) {
      queueMicrotask(() => setNotice(t("auth.sessionExpired")));
    }
  }, [searchParams, t]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setNotice(null);
    const { error: signInError } = await signIn(email, password);
    setSubmitting(false);
    if (signInError) {
      setError(authErrorMessage(signInError));
      return;
    }
    router.replace("/");
  }

  return (
    <AuthLayout>
      <AuthCard
        title={t("auth.login.title")}
        errorMessage={error}
        footer={
          <AuthFooterLink
            prompt={t("auth.login.noAccount")}
            href="/register"
            label={t("auth.login.createAccount")}
          />
        }
      >
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t("auth.fields.email")}</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">{t("auth.fields.password")}</Label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-muted-foreground underline-offset-4 hover:underline"
                >
                  {t("auth.login.forgotPassword")}
                </Link>
              </div>
              <AuthPasswordField
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {notice ? (
              <p className="text-sm text-muted-foreground">{notice}</p>
            ) : null}
          </div>
          <Button
            type="submit"
            className={cn("h-12 w-full", AUTH_PRIMARY_CTA_TOP_CLASS)}
            disabled={submitting}
          >
            {submitting ? t("auth.login.submitting") : t("auth.login.submit")}
          </Button>
        </form>
      </AuthCard>
    </AuthLayout>
  );
}

export function RegisterScreen() {
  const t = useT();
  const router = useRouter();
  const authErrorMessage = useAuthErrorMessage();
  const { signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const { error: signUpError } = await signUp(email, password);
    setSubmitting(false);
    if (signUpError) {
      setError(authErrorMessage(signUpError));
      return;
    }
    router.replace("/verify-email");
    router.refresh();
  }

  return (
    <AuthLayout>
      <AuthCard
        title={t("auth.register.title")}
        errorMessage={error}
        footer={
          <AuthFooterLink
            prompt={t("auth.register.hasAccount")}
            href="/login"
            label={t("auth.register.signIn")}
          />
        }
      >
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t("auth.fields.email")}</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t("auth.fields.password")}</Label>
              <AuthPasswordField
                id="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                required
              />
              <p className="text-[0.8125rem] text-muted-foreground">
                {t("auth.register.passwordHint")}
              </p>
            </div>
          </div>
          <Button
            type="submit"
            className={cn("h-12 w-full", AUTH_PRIMARY_CTA_TOP_CLASS)}
            disabled={submitting}
          >
            {submitting ? t("auth.register.submitting") : t("auth.register.submit")}
          </Button>
        </form>
      </AuthCard>
    </AuthLayout>
  );
}

type VerifyPendingAction = "continue" | "resend" | null;

export function VerifyEmailScreen() {
  const t = useT();
  const router = useRouter();
  const authErrorMessage = useAuthErrorMessage();
  const { user, resendVerification, refreshSession, signOut } = useAuth();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<VerifyPendingAction>(null);

  async function handleResend() {
    setPendingAction("resend");
    setError(null);
    setMessage(null);
    const { error: resendError } = await resendVerification();
    setPendingAction(null);
    if (resendError) {
      setError(authErrorMessage(resendError));
      return;
    }
    setMessage(t("auth.verify.resendSuccess"));
  }

  async function handleContinue() {
    setPendingAction("continue");
    setError(null);
    setMessage(null);
    const nextUser = await refreshSession();
    setPendingAction(null);
    if (nextUser?.email_confirmed_at) {
      router.replace("/");
      router.refresh();
    } else {
      setError(t("auth.verify.notVerifiedYet"));
    }
  }

  async function handleSignOut() {
    await signOut();
    router.replace("/login");
    router.refresh();
  }

  const isBusy = pendingAction !== null;

  return (
    <AuthLayout>
      <AuthCard title={t("auth.verify.title")} errorMessage={error}>
        {user?.email ? (
          <p className="text-sm font-medium">{user.email}</p>
        ) : null}

        {message ? (
          <p className="mt-4 text-sm text-muted-foreground">{message}</p>
        ) : null}

        <div className={cn("space-y-3", AUTH_PRIMARY_CTA_TOP_CLASS)}>
          <Button
            className="h-12 w-full"
            onClick={handleContinue}
            disabled={isBusy}
          >
            {pendingAction === "continue"
              ? t("auth.verify.continuing")
              : t("auth.verify.continue")}
          </Button>
          <Button
            variant="outline"
            className="h-12 w-full"
            onClick={handleResend}
            disabled={isBusy}
          >
            {pendingAction === "resend"
              ? t("auth.verify.resending")
              : t("auth.verify.resend")}
          </Button>
          <Button
            variant="ghost"
            className="h-11 w-full"
            onClick={handleSignOut}
            disabled={isBusy}
          >
            {t("auth.verify.signOut")}
          </Button>
        </div>
      </AuthCard>
    </AuthLayout>
  );
}

export function ForgotPasswordScreen() {
  const t = useT();
  const authErrorMessage = useAuthErrorMessage();
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const { error: resetError } = await resetPassword(email);
    setSubmitting(false);
    if (resetError) {
      setError(authErrorMessage(resetError));
      return;
    }
    setSent(true);
  }

  return (
    <AuthLayout>
      <AuthCard
        title={t("auth.forgot.title")}
        errorMessage={error}
        footer={
          <AuthFooterLink
            prompt={t("auth.forgot.remembered")}
            href="/login"
            label={t("auth.forgot.backToLogin")}
          />
        }
      >
        {sent ? (
          <p className="text-sm text-muted-foreground">{t("auth.forgot.sent")}</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t("auth.fields.email")}</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <Button
              type="submit"
              className={cn("h-12 w-full", AUTH_PRIMARY_CTA_TOP_CLASS)}
              disabled={submitting}
            >
              {submitting ? t("auth.forgot.submitting") : t("auth.forgot.submit")}
            </Button>
          </form>
        )}
      </AuthCard>
    </AuthLayout>
  );
}

export function ResetPasswordScreen() {
  const t = useT();
  const router = useRouter();
  const authErrorMessage = useAuthErrorMessage();
  const { updatePassword } = useAuth();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const { error: updateError } = await updatePassword(password);
    setSubmitting(false);
    if (updateError) {
      setError(authErrorMessage(updateError));
      return;
    }
    router.replace("/login?password_updated=1");
    router.refresh();
  }

  return (
    <AuthLayout>
      <AuthCard title={t("auth.reset.title")} errorMessage={error}>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">{t("auth.fields.newPassword")}</Label>
              <AuthPasswordField
                id="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                required
              />
            </div>
          </div>
          <Button
            type="submit"
            className={cn("h-12 w-full", AUTH_PRIMARY_CTA_TOP_CLASS)}
            disabled={submitting}
          >
            {submitting ? t("auth.reset.submitting") : t("auth.reset.submit")}
          </Button>
        </form>
      </AuthCard>
    </AuthLayout>
  );
}
