"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { AuthInputField } from "@/components/forms/auth-input-field";
import { AuthPasswordField } from "@/components/forms/auth-password-field";
import { InputFieldLabel } from "@/components/forms/input-field";
import {
  AuthCard,
  AUTH_PRIMARY_CTA_TOP_CLASS,
  AuthFooterLink,
  AuthLayout,
} from "@/components/layout/auth-layout";
import {
  getPendingVerificationEmail,
  setPendingVerificationEmail,
} from "@/lib/auth/pending-verification-email";
import { consumeSessionExpiredNotice } from "@/lib/auth/session-notice";
import { useAuthErrorMessage } from "@/lib/auth/use-auth-error-message";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useT } from "@/providers/i18n-provider";
import { useAuth } from "@/providers/auth-provider";

function isValidEmailAddress(value: string) {
  // Keep intentionally simple + predictable (avoid browser-native validation UI).
  return /^\S+@\S+\.\S+$/.test(value.trim());
}

export function LoginScreen() {
  const t = useT();
  const router = useRouter();
  const searchParams = useSearchParams();
  const authErrorMessage = useAuthErrorMessage();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
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
    const trimmedEmail = email.trim();
    const nextEmailError =
      trimmedEmail.length === 0
        ? t("auth.validation.emailRequired")
        : isValidEmailAddress(trimmedEmail)
          ? null
          : t("auth.validation.emailInvalid");
    const nextPasswordError =
      password.length === 0 ? t("auth.validation.passwordRequired") : null;

    setEmailError(nextEmailError);
    setPasswordError(nextPasswordError);
    if (nextEmailError || nextPasswordError) return;

    setSubmitting(true);
    setError(null);
    setNotice(null);
    const { error: signInError, requiresVerification } = await signIn(
      trimmedEmail,
      password,
    );
    setSubmitting(false);
    if (signInError) {
      setError(authErrorMessage(signInError));
      return;
    }
    if (requiresVerification) {
      setPendingVerificationEmail(trimmedEmail);
      router.replace("/verify-email");
      router.refresh();
      return;
    }
    router.replace("/splash");
    router.refresh();
  }

  return (
    <AuthLayout>
      <AuthCard
        title={t("auth.login.title")}
        errorMessage={error}
      >
        <form noValidate onSubmit={handleSubmit} className="flex flex-1 flex-col">
          <div className="space-y-4">
              <AuthInputField
                id="email"
                label={t("auth.fields.email")}
                required
                error={emailError ?? undefined}
              >
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    const next = e.target.value;
                    setEmail(next);
                    if (emailError) {
                      const trimmed = next.trim();
                      const nextError =
                        trimmed.length === 0
                          ? t("auth.validation.emailRequired")
                          : isValidEmailAddress(trimmed)
                            ? null
                            : t("auth.validation.emailInvalid");
                      setEmailError(nextError);
                    }
                  }}
                  required
                />
              </AuthInputField>
              <AuthInputField
                id="password"
                required
                error={passwordError ?? undefined}
                label={
                  <div className="flex items-center justify-between gap-2">
                    <InputFieldLabel htmlFor="password" required>
                      {t("auth.fields.password")}
                    </InputFieldLabel>
                    <Link
                      href="/forgot-password"
                      className="shrink-0 text-xs text-muted-foreground underline-offset-4 hover:underline"
                    >
                      {t("auth.login.forgotPassword")}
                    </Link>
                  </div>
                }
              >
                <AuthPasswordField
                  id="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    const next = e.target.value;
                    setPassword(next);
                    if (passwordError) {
                      setPasswordError(
                        next.length === 0
                          ? t("auth.validation.passwordRequired")
                          : null,
                      );
                    }
                  }}
                  required
                />
              </AuthInputField>
              {notice ? (
                <p className="text-sm text-muted-foreground">{notice}</p>
              ) : null}
          </div>

          <div className="mt-auto">
            <Button
              type="submit"
              className={cn("h-12 w-full", AUTH_PRIMARY_CTA_TOP_CLASS)}
              disabled={submitting}
            >
              {submitting ? t("auth.login.submitting") : t("auth.login.submit")}
            </Button>
            <AuthFooterLink
              prompt={t("auth.login.noAccount")}
              href="/register"
              label={t("auth.login.createAccount")}
            />
          </div>
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
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedEmail = email.trim();
    const nextEmailError =
      trimmedEmail.length === 0
        ? t("auth.validation.emailRequired")
        : isValidEmailAddress(trimmedEmail)
          ? null
          : t("auth.validation.emailInvalid");
    const nextPasswordError =
      password.length === 0
        ? t("auth.validation.passwordRequired")
        : password.length < 8
          ? t("auth.validation.passwordMinLength")
          : null;

    setEmailError(nextEmailError);
    setPasswordError(nextPasswordError);
    if (nextEmailError || nextPasswordError) return;

    setSubmitting(true);
    setError(null);
    const { error: signUpError } = await signUp(trimmedEmail, password);
    setSubmitting(false);
    if (signUpError) {
      setError(authErrorMessage(signUpError));
      return;
    }
    setPendingVerificationEmail(trimmedEmail);
    router.replace("/verify-email");
    router.refresh();
  }

  return (
    <AuthLayout>
      <AuthCard
        title={t("auth.register.title")}
        errorMessage={error}
      >
        <form noValidate onSubmit={handleSubmit} className="flex flex-1 flex-col">
          <div className="space-y-4">
              <AuthInputField
                id="email"
                label={t("auth.fields.email")}
                required
                error={emailError ?? undefined}
              >
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    const next = e.target.value;
                    setEmail(next);
                    if (emailError) {
                      const trimmed = next.trim();
                      const nextError =
                        trimmed.length === 0
                          ? t("auth.validation.emailRequired")
                          : isValidEmailAddress(trimmed)
                            ? null
                            : t("auth.validation.emailInvalid");
                      setEmailError(nextError);
                    }
                  }}
                  required
                />
              </AuthInputField>
              <AuthInputField
                id="password"
                label={t("auth.fields.password")}
                required
                error={passwordError ?? undefined}
                hint={t("auth.register.passwordHint")}
              >
                <AuthPasswordField
                  id="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => {
                    const next = e.target.value;
                    setPassword(next);
                    if (passwordError) {
                      setPasswordError(
                        next.length === 0
                          ? t("auth.validation.passwordRequired")
                          : next.length < 8
                            ? t("auth.validation.passwordMinLength")
                            : null,
                      );
                    }
                  }}
                  minLength={8}
                  required
                />
              </AuthInputField>
          </div>

          <div className="mt-auto">
            <Button
              type="submit"
              className={cn("h-12 w-full", AUTH_PRIMARY_CTA_TOP_CLASS)}
              disabled={submitting}
            >
              {submitting
                ? t("auth.register.submitting")
                : t("auth.register.submit")}
            </Button>
            <AuthFooterLink
              prompt={t("auth.register.hasAccount")}
              href="/login"
              label={t("auth.register.signIn")}
            />
          </div>
        </form>
      </AuthCard>
    </AuthLayout>
  );
}

type VerifyPendingAction = "resend" | null;

export function VerifyEmailScreen() {
  const t = useT();
  const router = useRouter();
  const authErrorMessage = useAuthErrorMessage();
  const { user, resendVerification, signOut } = useAuth();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<VerifyPendingAction>(null);
  const [pinnedEmail] = useState<string | null>(
    () => user?.email ?? getPendingVerificationEmail(),
  );
  const liveEmail = user?.email ?? getPendingVerificationEmail();
  const displayEmail = liveEmail ?? pinnedEmail;

  async function handleSignIn() {
    // If the user has an unverified session (e.g. after attempting login),
    // navigating to /login would bounce back to /verify-email via middleware.
    await signOut();
    router.replace("/login");
    router.refresh();
  }

  async function handleResend() {
    setPendingAction("resend");
    setError(null);
    setMessage(null);
    const { error: resendError } = await resendVerification(
      displayEmail ?? undefined,
    );
    setPendingAction(null);
    if (resendError) {
      setError(authErrorMessage(resendError));
      return;
    }
    setMessage(t("auth.checkEmail.resendSuccess"));
  }

  const isBusy = pendingAction !== null;

  return (
    <AuthLayout>
      <AuthCard
        title={t("auth.checkEmail.title")}
        errorMessage={error}
      >
        <form
          noValidate
          className="flex flex-1 flex-col"
          onSubmit={(event) => event.preventDefault()}
        >
          <div>
            <p className="text-sm text-muted-foreground">
              {displayEmail ? (
                <>
                  {t("auth.checkEmail.openPrefix")}{" "}
                  <span className="font-medium text-foreground">{displayEmail}</span>{" "}
                  {t("auth.checkEmail.openSuffix")}
                </>
              ) : (
                t("auth.checkEmail.noEmail")
              )}
            </p>

            {message ? (
              <p className="mt-4 text-sm text-muted-foreground">{message}</p>
            ) : null}
          </div>

          <div className="mt-auto">
            <Button
              type="button"
              className={cn("h-12 w-full", AUTH_PRIMARY_CTA_TOP_CLASS)}
              onClick={handleSignIn}
              disabled={isBusy}
            >
              {t("auth.checkEmail.signIn")}
            </Button>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              {t("auth.checkEmail.resendPrompt")}{" "}
              <Button
                type="button"
                variant="link"
                className="h-auto p-0 text-sm font-medium"
                onClick={handleResend}
                disabled={isBusy || !displayEmail}
              >
                {pendingAction === "resend"
                  ? t("auth.checkEmail.resending")
                  : t("auth.checkEmail.resend")}
              </Button>
            </p>
          </div>
        </form>
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
  const [emailError, setEmailError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedEmail = email.trim();
    const nextEmailError =
      trimmedEmail.length === 0
        ? t("auth.validation.emailRequired")
        : isValidEmailAddress(trimmedEmail)
          ? null
          : t("auth.validation.emailInvalid");
    setEmailError(nextEmailError);
    if (nextEmailError) return;

    setSubmitting(true);
    setError(null);
    const { error: resetError } = await resetPassword(trimmedEmail);
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
      >
        {sent ? (
          <div className="flex flex-1 flex-col">
            <p className="text-sm text-muted-foreground">{t("auth.forgot.sent")}</p>
            <div className="mt-auto">
              <AuthFooterLink
                prompt={t("auth.forgot.remembered")}
                href="/login"
                label={t("auth.forgot.backToLogin")}
              />
            </div>
          </div>
        ) : (
          <form noValidate onSubmit={handleSubmit} className="flex flex-1 flex-col">
            <div className="space-y-4">
              <AuthInputField
                id="email"
                label={t("auth.fields.email")}
                required
                error={emailError ?? undefined}
              >
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    const next = e.target.value;
                    setEmail(next);
                    if (emailError) {
                      const trimmed = next.trim();
                      const nextError =
                        trimmed.length === 0
                          ? t("auth.validation.emailRequired")
                          : isValidEmailAddress(trimmed)
                            ? null
                            : t("auth.validation.emailInvalid");
                      setEmailError(nextError);
                    }
                  }}
                  required
                />
              </AuthInputField>
            </div>

            <div className="mt-auto">
              <Button
                type="submit"
                className={cn("h-12 w-full", AUTH_PRIMARY_CTA_TOP_CLASS)}
                disabled={submitting}
              >
                {submitting ? t("auth.forgot.submitting") : t("auth.forgot.submit")}
              </Button>
              <AuthFooterLink
                prompt={t("auth.forgot.remembered")}
                href="/login"
                label={t("auth.forgot.backToLogin")}
              />
            </div>
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
  const { updatePassword, signOut } = useAuth();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const nextPasswordError =
      password.length === 0
        ? t("auth.validation.passwordRequired")
        : password.length < 8
          ? t("auth.validation.passwordMinLength")
          : null;
    setPasswordError(nextPasswordError);
    if (nextPasswordError) return;

    setSubmitting(true);
    setError(null);
    const { error: updateError } = await updatePassword(password);
    setSubmitting(false);
    if (updateError) {
      setError(authErrorMessage(updateError));
      return;
    }
    await signOut();
    router.replace("/login?password_updated=1");
    router.refresh();
  }

  return (
    <AuthLayout>
      <AuthCard title={t("auth.reset.title")} errorMessage={error}>
        <form noValidate onSubmit={handleSubmit} className="flex flex-1 flex-col">
          <div className="space-y-4">
            <AuthInputField
              id="password"
              label={t("auth.fields.newPassword")}
              required
              error={passwordError ?? undefined}
            >
              <AuthPasswordField
                id="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => {
                  const next = e.target.value;
                  setPassword(next);
                  if (passwordError) {
                    setPasswordError(
                      next.length === 0
                        ? t("auth.validation.passwordRequired")
                        : next.length < 8
                          ? t("auth.validation.passwordMinLength")
                          : null,
                    );
                  }
                }}
                minLength={8}
                required
              />
            </AuthInputField>
          </div>

          <div className="mt-auto">
            <Button
              type="submit"
              className={cn("h-12 w-full", AUTH_PRIMARY_CTA_TOP_CLASS)}
              disabled={submitting}
            >
              {submitting ? t("auth.reset.submitting") : t("auth.reset.submit")}
            </Button>
          </div>
        </form>
      </AuthCard>
    </AuthLayout>
  );
}
