"use client";

import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";

import {
  AuthCard,
  AuthLayout,
} from "@/components/layout/auth-layout";
import { TextButton } from "@/components/patterns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  OtpInput,
  refocusOtpInput,
  type OtpInputHandle,
} from "@/components/ui/otp-input";
import { sendEmailOtp, verifyEmailOtp } from "@/lib/auth/email-otp";
import { consumeSessionExpiredNotice } from "@/lib/auth/session-notice";
import { useAuthErrorMessage } from "@/lib/auth/use-auth-error-message";
import { useEmailSendCooldown } from "@/lib/auth/use-email-send-cooldown";
import { useT } from "@/providers/i18n-provider";

type ContinueStep = "email" | "otp";

function isValidEmailAddress(value: string) {
  return /^\S+@\S+\.\S+$/.test(value.trim());
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
  const [notice] = useState<string | null>(() =>
    consumeSessionExpiredNotice() ? t("auth.sessionExpired") : null,
  );
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);

  const verifyOtpCode = useCallback(
    async (normalizedOtp: string) => {
      const nextOtpError =
        normalizedOtp.length === 0 ? t("auth.continue.otpRequired") : null;

      setOtpError(nextOtpError);
      if (nextOtpError) {
        refocusOtpInput(otpInputRef.current);
        return;
      }
      if (verifyingOtpRef.current) return;

      verifyingOtpRef.current = true;
      setError(null);
      setMessage(null);

      const { error: verifyError } = await verifyEmailOtp(email, normalizedOtp);
      verifyingOtpRef.current = false;

      if (verifyError) {
        setError(t("auth.continue.otpInvalid"));
        setOtp("");
        refocusOtpInput(otpInputRef.current);
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
    setEmail(trimmedEmail);
    setOtp("");
    setOtpError(null);
    emailSendCooldown.clear();
    setStep("otp");
    refocusOtpInput(otpInputRef.current);

    const { error: sendError } = await sendEmailOtp(trimmedEmail);
    setSubmitting(false);

    if (sendError) {
      setStep("email");
      if (sendError.code === "emailSendRateLimit") {
        emailSendCooldown.start(sendError.retryAfterSeconds);
        refocusEmailField(emailInputRef.current);
        return;
      }
      setError(authErrorMessage(sendError));
      refocusEmailField(emailInputRef.current);
      return;
    }
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
        refocusOtpInput(otpInputRef.current);
        return;
      }
      setError(authErrorMessage(resendError));
      refocusOtpInput(otpInputRef.current);
      return;
    }

    setMessage(t("auth.continue.resendSuccess"));
    refocusOtpInput(otpInputRef.current);
  }

  function handleChangeEmail() {
    setStep("email");
    setOtp("");
    setOtpError(null);
    setError(null);
    setMessage(null);
    emailSendCooldown.clear();
    refocusEmailField(emailInputRef.current);
  }

  function handleOtpChange(next: string) {
    setOtp(next);
    if (otpError && next.length > 0) {
      setOtpError(null);
    }
    if (next.length === 6 && !verifyingOtpRef.current) {
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
  const bannerTone = message && bannerMessage === message ? "success" : "error";

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
        messageTone={bannerTone}
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
                  disabled={resending}
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
            <TextButton
              type="submit"
              form="continue-email-form"
              label={
                submitting
                  ? t("auth.continue.emailSubmitting")
                  : t("auth.continue.emailSubmit")
              }
              disabled={submitting || emailSendCooldown.isActive}
              onMouseDown={(event) => event.preventDefault()}
            />
          ) : undefined
        }
      >
        <div className={step === "email" ? undefined : "hidden"}>
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
              placeholder={t("auth.continue.emailPlaceholder")}
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
        </div>
        <div className={step === "otp" ? undefined : "hidden"}>
          <OtpInput
            ref={otpInputRef}
            id="continue-otp"
            aria-label={t("auth.continue.otpLabel")}
            getDigitAriaLabel={(index, length) =>
              t("auth.continue.otpDigitAriaLabel", {
                label: t("auth.continue.otpLabel"),
                current: index + 1,
                total: length,
              })
            }
            value={otp}
            onChange={handleOtpChange}
          />
        </div>
      </AuthCard>
    </AuthLayout>
  );
}
