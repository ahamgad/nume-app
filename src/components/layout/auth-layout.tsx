import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { InputFieldLabel } from "@/components/forms/input-field";
import { RootPageTitle } from "@/components/layout/stack-page-chrome";
import { WidgetCard } from "@/components/patterns";
import { cn } from "@/lib/utils";
import { useT } from "@/providers/i18n-provider";

/** 24px — rhythm between the input block and primary CTA. */
export const AUTH_PRIMARY_CTA_TOP_CLASS = "mt-6";

/** Reserved height for validation, error, and status copy. */
export const AUTH_MESSAGE_AREA_CLASS = "mt-4 min-h-10 text-sm leading-5";

/** Reserved height for OTP footer links so both steps stay aligned. */
export const AUTH_FOOTER_AREA_CLASS = "mt-6 min-h-[5.5rem]";

export function AuthBrandLogo() {
  const t = useT();

  return (
    <>
      <Image
        src="/brand-flatten-black.svg"
        alt={t("common.brandName")}
        width={48}
        height={48}
        className="dark:hidden"
        priority
      />
      <Image
        src="/brand-flatten-white.svg"
        alt={t("common.brandName")}
        width={48}
        height={48}
        className="hidden dark:block"
        priority
      />
    </>
  );
}

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="fixed inset-0 overflow-hidden bg-background">
      <div className="mx-auto flex h-dvh w-full max-w-lg flex-col px-4 pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)]">
        <div className="w-full max-w-sm shrink-0 pt-8">{children}</div>
        <div aria-hidden className="min-h-0 flex-1" />
      </div>
    </div>
  );
}

interface AuthCardProps {
  title: string;
  message?: string | null;
  messageRole?: "alert" | "status";
  fieldId: string;
  label: string;
  required?: boolean;
  children: ReactNode;
  primaryAction: ReactNode;
  footer?: ReactNode;
  className?: string;
}

/** Top-aligned auth step shell with stable section heights. */
export function AuthCard({
  title,
  message,
  messageRole = "alert",
  fieldId,
  label,
  required = false,
  children,
  primaryAction,
  footer,
  className,
}: AuthCardProps) {
  return (
    <WidgetCard paddingClass="p-4" className={cn("w-full", className)}>
      <AuthBrandLogo />
      <RootPageTitle className="mb-0 mt-4">{title}</RootPageTitle>
      <div className={AUTH_MESSAGE_AREA_CLASS}>
        {message ? (
          <p
            className="text-destructive"
            role={messageRole}
            aria-live={messageRole === "status" ? "polite" : undefined}
          >
            {message}
          </p>
        ) : null}
      </div>
      <div className="mt-4">
        <InputFieldLabel htmlFor={fieldId} required={required}>
          {label}
        </InputFieldLabel>
        <div className="mt-2">{children}</div>
        <div className={AUTH_PRIMARY_CTA_TOP_CLASS}>{primaryAction}</div>
        <div className={AUTH_FOOTER_AREA_CLASS}>{footer}</div>
      </div>
    </WidgetCard>
  );
}

interface AuthFooterLinkProps {
  prompt: string;
  href: string;
  label: string;
  className?: string;
}

export function AuthFooterLink({
  prompt,
  href,
  label,
  className,
}: AuthFooterLinkProps) {
  return (
    <p className={cn("text-center text-sm text-muted-foreground", className)}>
      {prompt}{" "}
      <Link
        href={href}
        className="font-medium text-foreground underline-offset-4 hover:underline"
      >
        {label}
      </Link>
    </p>
  );
}
