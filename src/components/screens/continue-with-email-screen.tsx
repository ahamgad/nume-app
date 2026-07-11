"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  AuthCard,
  AuthLayout,
} from "@/components/layout/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OtpInput } from "@/components/ui/otp-input";
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

export function ContinueWithEmailScreen() {
  const t = useT();
  const router = useRouter();
  const authErrorMessage = useAuthErrorMessage();
  const emailSendCooldown = useEmailSendCooldown();
  const verifyingOtpRef = useRef(false);

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

  const verifyOtpCode = useCallback(
    async (normalizedOtp: string) => {
      const nextOtpError =
        normalizedOtp.length === 0 ? t("auth.continue.otpRequired") : null;

      setOtpError(nextOtpError);
      if (nextOtpError || verifyingOtpRef.current) return;

      verifyingOtpRef.current = true;
      setSubmitting(true);
      setError(null);
      setMessage(null);

      const { error: verifyError } = await verifyEmailOtp(email, normalizedOtp);
      verifyingOtpRef.current = false;
      setSubmitting(false);

      if (verifyError) {
        setError(t("auth.continue.otpInvalid"));
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
    if (nextEmailError) return;

    setSubmitting(true);
    setError(null);
    setMessage(null);

    const { error: sendError } = await sendEmailOtp(trimmedEmail);
    setSubmitting(false);

    if (sendError) {
      if (sendError.code === "emailSendRateLimit") {
        emailSendCooldown.start(sendError.retryAfterSeconds);
        return;
      }
      setError(authErrorMessage(sendError));
      return;
    }

    setEmail(trimmedEmail);
    setOtp("");
    setOtpError(null);
    emailSendCooldown.clear();
    setStep("otp");
  }

  async function handleOtpSubmit(event: React.FormEvent) {
    event.preventDefault();
    await verifyOtpCode(normalizeOtp(otp));
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
        return;
      }
      setError(authErrorMessage(resendError));
      return;
    }

    setMessage(t("auth.continue.resendSuccess"));
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
        fieldId={step === "email" ? "continue-email" : "continue-otp"}
        label={
          step === "email"
            ? t("auth.fields.email")
            : t("auth.continue.otpLabel")
        }
        required
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
          ) : null
        }
        primaryAction={
          <Button
            type="submit"
            form={step === "email" ? "continue-email-form" : "continue-otp-form"}
            className="h-12 w-full"
            disabled={
              step === "email"
                ? submitting || emailSendCooldown.isActive
                : submitting
            }
          >
            {step === "email"
              ? submitting
                ? t("auth.continue.emailSubmitting")
                : t("auth.continue.emailSubmit")
              : submitting
                ? t("auth.continue.otpSubmitting")
                : t("auth.continue.otpSubmit")}
          </Button>
        }
      >
        {step === "email" ? (
          <form
            id="continue-email-form"
            noValidate
            onSubmit={handleEmailSubmit}
          >
            <Input
              id="continue-email"
              type="email"
              autoComplete="email"
              enterKeyHint="next"
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
          <form id="continue-otp-form" noValidate onSubmit={handleOtpSubmit}>
            <OtpInput
              id="continue-otp"
              aria-label={t("auth.continue.otpLabel")}
              value={otp}
              autoFocus
              disabled={submitting}
              onChange={handleOtpChange}
            />
          </form>
        )}
      </AuthCard>
    </AuthLayout>
  );
}
