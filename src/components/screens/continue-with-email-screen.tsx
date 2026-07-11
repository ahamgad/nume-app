"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { AuthInputField } from "@/components/forms/auth-input-field";
import {
  AuthCard,
  AUTH_PRIMARY_CTA_TOP_CLASS,
  AuthLayout,
} from "@/components/layout/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OtpInput } from "@/components/ui/otp-input";
import { sendEmailOtp, verifyEmailOtp } from "@/lib/auth/email-otp";
import { consumeSessionExpiredNotice } from "@/lib/auth/session-notice";
import { useAuthErrorMessage } from "@/lib/auth/use-auth-error-message";
import { useEmailSendCooldown } from "@/lib/auth/use-email-send-cooldown";
import { cn } from "@/lib/utils";
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
    const normalizedOtp = normalizeOtp(otp);
    const nextOtpError =
      normalizedOtp.length === 0 ? t("auth.continue.otpRequired") : null;

    setOtpError(nextOtpError);
    if (nextOtpError) return;

    setSubmitting(true);
    setError(null);
    setMessage(null);

    const { error: verifyError } = await verifyEmailOtp(email, normalizedOtp);
    setSubmitting(false);

    if (verifyError) {
      setError(t("auth.continue.otpInvalid"));
      return;
    }

    router.replace("/splash");
    router.refresh();
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

  if (step === "email") {
    return (
      <AuthLayout>
        <AuthCard
          title={t("auth.continue.emailTitle")}
          errorMessage={error}
          statusMessage={notice ?? emailSendCooldown.message}
        >
          <form noValidate onSubmit={handleEmailSubmit} className="flex flex-1 flex-col">
            <div className="space-y-4">
              <p className="text-[0.9375rem] leading-relaxed text-muted-foreground">
                {t("auth.continue.emailLead")}
              </p>
              <AuthInputField
                id="continue-email"
                label={t("auth.fields.email")}
                required
                error={emailError ?? undefined}
              >
                <Input
                  id="continue-email"
                  type="email"
                  autoComplete="email"
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
              </AuthInputField>
            </div>

            <div className="mt-auto">
              <Button
                type="submit"
                className={cn("h-12 w-full", AUTH_PRIMARY_CTA_TOP_CLASS)}
                disabled={submitting || emailSendCooldown.isActive}
              >
                {submitting
                  ? t("auth.continue.emailSubmitting")
                  : t("auth.continue.emailSubmit")}
              </Button>
            </div>
          </form>
        </AuthCard>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <AuthCard
        title={t("auth.continue.otpTitle")}
        errorMessage={error}
        statusMessage={message ?? emailSendCooldown.message}
      >
        <form noValidate onSubmit={handleOtpSubmit} className="flex flex-1 flex-col">
          <div className="space-y-4">
            <p className="text-[0.9375rem] leading-relaxed text-muted-foreground">
              {t("auth.continue.otpLead", { email })}
            </p>
            <AuthInputField
              id="continue-otp"
              label={t("auth.continue.otpLabel")}
              required
              error={otpError ?? undefined}
            >
              <OtpInput
                id="continue-otp"
                aria-label={t("auth.continue.otpLabel")}
                value={otp}
                autoFocus
                onChange={(next) => {
                  setOtp(next);
                  if (otpError && next.length > 0) {
                    setOtpError(null);
                  }
                }}
              />
            </AuthInputField>
          </div>

          <div className="mt-auto space-y-3">
            <Button
              type="submit"
              className={cn("h-12 w-full", AUTH_PRIMARY_CTA_TOP_CLASS)}
              disabled={submitting}
            >
              {submitting
                ? t("auth.continue.otpSubmitting")
                : t("auth.continue.otpSubmit")}
            </Button>
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
        </form>
      </AuthCard>
    </AuthLayout>
  );
}
