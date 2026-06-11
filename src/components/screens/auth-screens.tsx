"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { AuthFooterLink, AuthLayout } from "@/components/layout/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useT } from "@/providers/i18n-provider";
import { useAuth } from "@/providers/auth-provider";

export function LoginScreen() {
  const t = useT();
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const { error: signInError } = await signIn(email, password);
    setSubmitting(false);
    if (signInError) {
      setError(signInError);
      return;
    }
    router.replace("/");
    router.refresh();
  }

  return (
    <AuthLayout>
      <div className="mx-auto w-full max-w-sm">
        <h1 className="text-center text-2xl font-semibold tracking-tight">
          {t("auth.login.title")}
        </h1>
        <p className="mt-2 text-center text-[0.9375rem] text-muted-foreground">
          {t("auth.login.lead")}
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
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
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Button type="submit" className="h-12 w-full" disabled={submitting}>
            {submitting ? t("auth.login.submitting") : t("auth.login.submit")}
          </Button>
        </form>

        <AuthFooterLink
          prompt={t("auth.login.noAccount")}
          href="/register"
          label={t("auth.login.createAccount")}
        />
      </div>
    </AuthLayout>
  );
}

export function RegisterScreen() {
  const t = useT();
  const router = useRouter();
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
      setError(signUpError);
      return;
    }
    router.replace("/verify-email");
    router.refresh();
  }

  return (
    <AuthLayout>
      <div className="mx-auto w-full max-w-sm">
        <h1 className="text-center text-2xl font-semibold tracking-tight">
          {t("auth.register.title")}
        </h1>
        <p className="mt-2 text-center text-[0.9375rem] text-muted-foreground">
          {t("auth.register.lead")}
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
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
            <Input
              id="password"
              type="password"
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
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Button type="submit" className="h-12 w-full" disabled={submitting}>
            {submitting ? t("auth.register.submitting") : t("auth.register.submit")}
          </Button>
        </form>

        <AuthFooterLink
          prompt={t("auth.register.hasAccount")}
          href="/login"
          label={t("auth.register.signIn")}
        />
      </div>
    </AuthLayout>
  );
}

export function VerifyEmailScreen() {
  const t = useT();
  const router = useRouter();
  const { user, resendVerification, refreshSession, signOut } = useAuth();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleResend() {
    setSubmitting(true);
    setError(null);
    const { error: resendError } = await resendVerification();
    setSubmitting(false);
    if (resendError) {
      setError(resendError);
      return;
    }
    setMessage(t("auth.verify.resendSuccess"));
  }

  async function handleContinue() {
    setSubmitting(true);
    await refreshSession();
    setSubmitting(false);
    if (user?.email_confirmed_at) {
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

  return (
    <AuthLayout>
      <div className="mx-auto w-full max-w-sm text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          {t("auth.verify.title")}
        </h1>
        <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted-foreground">
          {t("auth.verify.lead")}
        </p>
        {user?.email ? (
          <p className="mt-2 text-sm font-medium">{user.email}</p>
        ) : null}

        {message ? (
          <p className="mt-4 text-sm text-muted-foreground">{message}</p>
        ) : null}
        {error ? <p className="mt-4 text-sm text-destructive">{error}</p> : null}

        <div className="mt-8 space-y-3">
          <Button
            className="h-12 w-full"
            onClick={handleContinue}
            disabled={submitting}
          >
            {t("auth.verify.continue")}
          </Button>
          <Button
            variant="outline"
            className="h-12 w-full"
            onClick={handleResend}
            disabled={submitting}
          >
            {t("auth.verify.resend")}
          </Button>
          <Button
            variant="ghost"
            className="h-11 w-full"
            onClick={handleSignOut}
          >
            {t("auth.verify.signOut")}
          </Button>
        </div>
      </div>
    </AuthLayout>
  );
}

export function ForgotPasswordScreen() {
  const t = useT();
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
      setError(resetError);
      return;
    }
    setSent(true);
  }

  return (
    <AuthLayout>
      <div className="mx-auto w-full max-w-sm">
        <h1 className="text-center text-2xl font-semibold tracking-tight">
          {t("auth.forgot.title")}
        </h1>
        <p className="mt-2 text-center text-[0.9375rem] text-muted-foreground">
          {sent ? t("auth.forgot.sent") : t("auth.forgot.lead")}
        </p>

        {!sent ? (
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
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
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <Button type="submit" className="h-12 w-full" disabled={submitting}>
              {submitting ? t("auth.forgot.submitting") : t("auth.forgot.submit")}
            </Button>
          </form>
        ) : null}

        <AuthFooterLink
          prompt={t("auth.forgot.remembered")}
          href="/login"
          label={t("auth.forgot.backToLogin")}
        />
      </div>
    </AuthLayout>
  );
}

export function ResetPasswordScreen() {
  const t = useT();
  const router = useRouter();
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
      setError(updateError);
      return;
    }
    router.replace("/login");
    router.refresh();
  }

  return (
    <AuthLayout>
      <div className="mx-auto w-full max-w-sm">
        <h1 className="text-center text-2xl font-semibold tracking-tight">
          {t("auth.reset.title")}
        </h1>
        <p className="mt-2 text-center text-[0.9375rem] text-muted-foreground">
          {t("auth.reset.lead")}
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">{t("auth.fields.newPassword")}</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
            />
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Button type="submit" className="h-12 w-full" disabled={submitting}>
            {submitting ? t("auth.reset.submitting") : t("auth.reset.submit")}
          </Button>
        </form>
      </div>
    </AuthLayout>
  );
}
