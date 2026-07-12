"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";

import { AccountDetailsBodySurface } from "@/components/accounts/account-details-chrome";
import { InputFieldLabel } from "@/components/forms/input-field";
import {
  AUTH_KEYBOARD_SURFACE_CLASS,
  useAuthViewportLock,
} from "@/hooks/use-auth-viewport-lock";
import { CARD_SURFACE_BG_CLASS } from "@/lib/layout/card-surface";
import { isKeyboardPresent } from "@/lib/scroll/scroll-input-into-view";
import { cn } from "@/lib/utils";
import { useT } from "@/providers/i18n-provider";

/** Page inset below the safe area (px). */
export const AUTH_PAGE_TOP_PADDING_PX = 24;

/** 12px — welcome title below logo. */
export const AUTH_LOGO_TO_WELCOME_CLASS = "mt-3";

/** 12px — step title to message slot. */
export const AUTH_TITLE_TO_MESSAGE_CLASS = "mt-3";

/** One-line message slot; expands when copy wraps. */
export const AUTH_MESSAGE_AREA_CLASS = "min-h-5 text-sm leading-5";

/** 16px — message slot to field block. */
export const AUTH_MESSAGE_TO_FIELD_CLASS = "mt-4";

/** 12px — field block to primary CTA. */
export const AUTH_PRIMARY_CTA_TOP_CLASS = "mt-3";

/** 12px — field block to OTP footer when no primary CTA. */
export const AUTH_OTP_FOOTER_TOP_CLASS = "mt-3";

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
  if (event.pointerType && event.pointerType !== "touch") return;

  event.preventDefault();

  // iOS can leave an input focused without presenting the keyboard after
  // programmatic mount focus. Re-engage editing under the current user gesture.
  if (document.activeElement === input && !isKeyboardPresent()) {
    input.blur();
  }

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

function AuthWelcomeTitle() {
  const t = useT();

  return (
    <h1 className="text-2xl font-semibold leading-tight tracking-tight text-foreground">
      {t("landing.title")}
    </h1>
  );
}

function AuthHero() {
  return (
    <div className="flex shrink-0 flex-col items-center px-4 pb-8 pt-2 text-center">
      <AuthBrandLogo />
      <AuthWelcomeTitle />
    </div>
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
    <h2
      className={cn(
        "text-2xl font-semibold leading-tight tracking-tight text-foreground",
        className,
      )}
    >
      {children}
    </h2>
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
        "mx-auto flex min-h-dvh w-full max-w-lg flex-col bg-background pb-[env(safe-area-inset-bottom)] pt-[calc(env(safe-area-inset-top)+24px)]",
        keyboardVisible && AUTH_KEYBOARD_SURFACE_CLASS,
      )}
    >
      <AuthHero />
      <AccountDetailsBodySurface
        className={cn("mt-auto flex flex-1 flex-col", CARD_SURFACE_BG_CLASS)}
      >
        {children}
      </AccountDetailsBodySurface>
    </div>
  );
}

interface AuthCardProps {
  title: string;
  message?: string | null;
  messageRole?: "alert" | "status";
  messageTone?: "default" | "error" | "success";
  fieldId?: string;
  label?: string;
  required?: boolean;
  children: ReactNode;
  primaryAction?: ReactNode;
  footer?: ReactNode;
  className?: string;
}

/** Auth step content inside the account-details body surface. */
export function AuthCard({
  title,
  message,
  messageRole = "alert",
  messageTone = "error",
  fieldId,
  label,
  required = false,
  children,
  primaryAction,
  footer,
  className,
}: AuthCardProps) {
  return (
    <div className={cn("w-full px-4 pb-6", className)}>
      <AuthTitle>{title}</AuthTitle>
      <div className={cn(AUTH_TITLE_TO_MESSAGE_CLASS, AUTH_MESSAGE_AREA_CLASS)}>
        {message ? (
          <p
            className={cn(
              messageTone === "success"
                ? "text-emerald-700 dark:text-emerald-300"
                : messageTone === "default"
                  ? "text-muted-foreground"
                  : "text-destructive",
            )}
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
              primaryAction
                ? AUTH_CTA_TO_FOOTER_CLASS
                : AUTH_OTP_FOOTER_TOP_CLASS,
              AUTH_FOOTER_AREA_CLASS,
            )}
          >
            {footer}
          </div>
        ) : null}
      </div>
    </div>
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
