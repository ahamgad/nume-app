"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  AuthCard,
  AuthLayout,
} from "@/components/layout/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OtpInput, type OtpInputHandle } from "@/components/ui/otp-input";
import { sendEmailOtp, verifyEmailOtp } from "@/lib/auth/email-otp";
import { consumeSessionExpiredNotice } from "@/lib/auth/session-notice";
import { useAuthErrorMessage } from "@/lib/auth/use-auth-error-message";
import { useEmailSendCooldown } from "@/lib/auth/use-email-send-cooldown";
import { useT } from "@/providers/i18n-provider";

type ContinueStep = "email" | "otp";

function isValidEmailAddress(value: string) {
  return /^\S+@\S+\.\S+$/.test(value.trim());
}

function normalizeOtp(value: string) {
  return value.replace(/\D/g, "").slice(0, 6);
}

function refocusEmailField(input: HTMLInputElement | null) {
  if (!input) return;
  queueMicrotask(() => {
    input.focus({ preventScroll: true });
  });
}

export function ContinueWithEmailScreen() {
  const t = useT();
  const router = useRouter();
  const authErrorMessage = useAuthErrorMessage();
  const emailSendCooldown = useEmailSendCooldown();
  const verifyingOtpRef = useRef(false);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const otpInputRef = useRef<OtpInputHandle>(null);

  const [step, setStep] = useState<ContinueStep>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (consumeSessionExpiredNotice()) {
      queueMicrotask(() => setNotice(t("auth.sessionExpired")));
    }
  }, [t]);

  useEffect(() => {
    if (step !== "otp") return;
    const frameId = window.requestAnimationFrame(() => {
      otpInputRef.current?.focusFirst();
    });
    return () => window.cancelAnimationFrame(frameId);
  }, [step]);

  const verifyOtpCode = useCallback(
    async (normalizedOtp: string) => {
      const nextOtpError =
        normalizedOtp.length === 0 ? t("auth.continue.otpRequired") : null;

      setOtpError(nextOtpError);
      if (nextOtpError) {
        otpInputRef.current?.focusFirst();
        return;
      }
      if (verifyingOtpRef.current) return;

      verifyingOtpRef.current = true;
      setSubmitting(true);
      setError(null);
      setMessage(null);

      const { error: verifyError } = await verifyEmailOtp(email, normalizedOtp);
      verifyingOtpRef.current = false;
      setSubmitting(false);

      if (verifyError) {
        setError(t("auth.continue.otpInvalid"));
        otpInputRef.current?.focusFirst();
        return;
      }

      router.replace("/splash");
      router.refresh();
    },
    [email, router, t],
  );

  async function handleEmailSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmedEmail = email.trim();
    const nextEmailError =
      trimmedEmail.length === 0
        ? t("auth.validation.emailRequired")
        : isValidEmailAddress(trimmedEmail)
          ? null
          : t("auth.validation.emailInvalid");

    setEmailError(nextEmailError);
    if (nextEmailError) {
      refocusEmailField(emailInputRef.current);
      return;
    }

    setSubmitting(true);
    setError(null);
    setMessage(null);

    const { error: sendError } = await sendEmailOtp(trimmedEmail);
    setSubmitting(false);

    if (sendError) {
      if (sendError.code === "emailSendRateLimit") {
        emailSendCooldown.start(sendError.retryAfterSeconds);
        refocusEmailField(emailInputRef.current);
        return;
      }
      setError(authErrorMessage(sendError));
      refocusEmailField(emailInputRef.current);
      return;
    }

    setEmail(trimmedEmail);
    setOtp("");
    setOtpError(null);
    emailSendCooldown.clear();
    setStep("otp");
  }

  async function handleResend() {
    if (emailSendCooldown.isActive) return;

    setResending(true);
    setError(null);
    setMessage(null);

    const { error: resendError } = await sendEmailOtp(email);
    setResending(false);

    if (resendError) {
      if (resendError.code === "emailSendRateLimit") {
        emailSendCooldown.start(resendError.retryAfterSeconds);
        otpInputRef.current?.focusFirst();
        return;
      }
      setError(authErrorMessage(resendError));
      otpInputRef.current?.focusFirst();
      return;
    }

    setMessage(t("auth.continue.resendSuccess"));
    otpInputRef.current?.focusFirst();
  }

  function handleChangeEmail() {
    setStep("email");
    setOtp("");
    setOtpError(null);
    setError(null);
    setMessage(null);
    emailSendCooldown.clear();
  }

  function handleOtpChange(next: string) {
    setOtp(next);
    if (otpError && next.length > 0) {
      setOtpError(null);
    }
    if (next.length === 6) {
      void verifyOtpCode(next);
    }
  }

  const fieldError = step === "email" ? emailError : otpError;
  const bannerMessage =
    fieldError ??
    error ??
    (step === "email" ? notice ?? emailSendCooldown.message : message ?? emailSendCooldown.message);
  const bannerRole =
    !fieldError && !error && (notice || message || emailSendCooldown.message)
      ? "status"
      : "alert";

  return (
    <AuthLayout>
      <AuthCard
        title={
          step === "email"
            ? t("auth.continue.emailTitle")
            : t("auth.continue.otpTitle")
        }
        message={bannerMessage}
        messageRole={bannerRole}
        footer={
          step === "otp" ? (
            <div className="space-y-3">
              <p className="text-center text-sm text-muted-foreground">
                {t("auth.continue.resendPrompt")}{" "}
                <Button
                  type="button"
                  variant="link"
                  className="h-auto p-0 text-sm font-medium"
                  disabled={resending || emailSendCooldown.isActive}
                  onClick={() => void handleResend()}
                >
                  {resending
                    ? t("auth.continue.resending")
                    : t("auth.continue.resend")}
                </Button>
              </p>
              <p className="text-center text-sm text-muted-foreground">
                <Button
                  type="button"
                  variant="link"
                  className="h-auto p-0 text-sm font-medium"
                  disabled={submitting || resending}
                  onClick={handleChangeEmail}
                >
                  {t("auth.continue.changeEmail")}
                </Button>
              </p>
            </div>
          ) : undefined
        }
        primaryAction={
          step === "email" ? (
            <Button
              type="submit"
              form="continue-email-form"
              className="h-12 w-full"
              disabled={submitting || emailSendCooldown.isActive}
            >
              {submitting
                ? t("auth.continue.emailSubmitting")
                : t("auth.continue.emailSubmit")}
            </Button>
          ) : undefined
        }
      >
        {step === "email" ? (
          <form
            id="continue-email-form"
            noValidate
            onSubmit={handleEmailSubmit}
          >
            <Input
              ref={emailInputRef}
              id="continue-email"
              type="email"
              autoComplete="email"
              enterKeyHint="go"
              aria-label={t("auth.fields.email")}
              value={email}
              onChange={(event) => {
                const next = event.target.value;
                setEmail(next);
                if (emailError) {
                  setEmailError(
                    next.trim().length === 0
                      ? t("auth.validation.emailRequired")
                      : isValidEmailAddress(next)
                        ? null
                        : t("auth.validation.emailInvalid"),
                  );
                }
              }}
              required
            />
          </form>
        ) : (
          <OtpInput
            ref={otpInputRef}
            id="continue-otp"
            aria-label={t("auth.continue.otpLabel")}
            value={otp}
            autoFocus
            disabled={submitting}
            onChange={handleOtpChange}
          />
        )}
      </AuthCard>
    </AuthLayout>
  );
}
