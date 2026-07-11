import { renderEmailFoundationHtml, renderOtpCodeBlock } from "./render";
import type { EmailFoundationContent } from "./render";

/** Supabase Go template token for the emailed OTP value. */
export const OTP_EMAIL_TOKEN = "{{ .Token }}";

export const otpEmailContent: EmailFoundationContent = {
  subject: "Your NUME sign-in code",
  preheader: "Use this code to continue to NUME",
  title: "Enter your code",
  description: "Use this code to continue signing in to NUME",
  primaryBlockHtml: renderOtpCodeBlock(OTP_EMAIL_TOKEN),
  helperText:
    "If you didn't request this code, you can safely ignore this email",
};

export function renderOtpEmailHtml() {
  return renderEmailFoundationHtml(otpEmailContent);
}

/** Local preview with a sample code for visual QA. */
export function renderOtpEmailPreviewHtml(code = "847293") {
  return renderEmailFoundationHtml({
    ...otpEmailContent,
    primaryBlockHtml: renderOtpCodeBlock(code),
  });
}
