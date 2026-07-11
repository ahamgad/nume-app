"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";

import { InputFieldLabel } from "@/components/forms/input-field";
import { WidgetCard } from "@/components/patterns";
import {
  AUTH_KEYBOARD_SURFACE_CLASS,
  useAuthViewportLock,
} from "@/hooks/use-auth-viewport-lock";
import { cn } from "@/lib/utils";
import { useT } from "@/providers/i18n-provider";

/** Page inset below the safe area (px). */
export const AUTH_PAGE_TOP_PADDING_PX = 24;

/** 12px — logo to title. */
export const AUTH_LOGO_TO_TITLE_CLASS = "mt-3";

/** 12px — title to message slot. */
export const AUTH_TITLE_TO_MESSAGE_CLASS = "mt-3";

/** One-line message slot; expands when copy wraps. */
export const AUTH_MESSAGE_AREA_CLASS =
  "min-h-5 text-base leading-5";

/** 16px — message slot to field block. */
export const AUTH_MESSAGE_TO_FIELD_CLASS = "mt-4";

/** 24px — input block to primary CTA. */
export const AUTH_PRIMARY_CTA_TOP_CLASS = "mt-6";

/** 16px — primary CTA to footer slot. */
export const AUTH_CTA_TO_FOOTER_CLASS = "mt-4";

/** OTP footer alignment slot — two link rows at text-sm. */
export const AUTH_FOOTER_AREA_CLASS = "min-h-[52px]";

function handleAuthTouchInputFocus(event: ReactPointerEvent<HTMLDivElement>) {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;

  const input = target.closest("input, textarea") as
    | HTMLInputElement
    | HTMLTextAreaElement
    | null;
  if (!input) return;
  if (input.disabled || input.readOnly) return;
  if (document.activeElement === input) return;
  if (event.pointerType && event.pointerType !== "touch") return;

  event.preventDefault();
  input.focus({ preventScroll: true });
}

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

function AuthTitle({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <h1
      className={cn(
        "text-2xl font-semibold leading-tight tracking-tight text-foreground",
        className,
      )}
    >
      {children}
    </h1>
  );
}

/** Content-driven auth gate page — natural height, top-aligned. */
export function AuthLayout({ children }: { children: ReactNode }) {
  const surfaceRef = useRef<HTMLDivElement>(null);
  const { keyboardVisible } = useAuthViewportLock(surfaceRef);

  return (
    <div
      ref={surfaceRef}
      data-auth-layout
      onPointerDownCapture={handleAuthTouchInputFocus}
      className={cn(
        "mx-auto w-full max-w-lg bg-background px-4 pb-[env(safe-area-inset-bottom)] pt-[calc(env(safe-area-inset-top)+24px)]",
        keyboardVisible && AUTH_KEYBOARD_SURFACE_CLASS,
      )}
    >
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}

interface AuthCardProps {
  title: string;
  message?: string | null;
  messageRole?: "alert" | "status";
  fieldId?: string;
  label?: string;
  required?: boolean;
  children: ReactNode;
  primaryAction?: ReactNode;
  footer?: ReactNode;
  className?: string;
}

/** Compact auth step shell with content-sized reserved slots. */
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
      <AuthTitle className={AUTH_LOGO_TO_TITLE_CLASS}>{title}</AuthTitle>
      <div className={cn(AUTH_TITLE_TO_MESSAGE_CLASS, AUTH_MESSAGE_AREA_CLASS)}>
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
      <div className={AUTH_MESSAGE_TO_FIELD_CLASS}>
        {label && fieldId ? (
          <>
            <InputFieldLabel htmlFor={fieldId} required={required}>
              {label}
            </InputFieldLabel>
            <div className="mt-2">{children}</div>
          </>
        ) : (
          children
        )}
        {primaryAction ? (
          <div className={AUTH_PRIMARY_CTA_TOP_CLASS}>{primaryAction}</div>
        ) : null}
        {footer ? (
          <div
            className={cn(
              primaryAction ? AUTH_CTA_TO_FOOTER_CLASS : AUTH_PRIMARY_CTA_TOP_CLASS,
              AUTH_FOOTER_AREA_CLASS,
            )}
          >
            {footer}
          </div>
        ) : null}
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
