"use client";

import Image from "next/image";
import Link from "next/link";
import type { CSSProperties, PointerEvent as ReactPointerEvent, ReactNode } from "react";

import { RootPageTitle } from "@/components/layout/stack-page-chrome";
import { WidgetCard } from "@/components/patterns";
import { useAuthViewportFrame } from "@/hooks/use-auth-viewport-frame";
import { ACCOUNT_FORM_SECTION_TITLE_TO_FIELDS_CLASS } from "@/lib/layout/account-form-chrome";
import { cn } from "@/lib/utils";
import { useT } from "@/providers/i18n-provider";

/** 24px — same rhythm as {@link SCREEN_PAGE_TITLE_TO_CONTENT_GAP_CLASS}. */
export const AUTH_PRIMARY_CTA_TOP_CLASS = "mt-6";

/** Matches iOS keyboard presentation timing. */
export const AUTH_KEYBOARD_FRAME_TRANSITION_CLASS =
  "transition-[height,transform] duration-[250ms] ease-out";

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

function handleAuthInputPointerDownCapture(
  event: ReactPointerEvent<HTMLDivElement>,
) {
  // Pre-focus stabilization: avoid Safari's focus-induced scroll nudge by
  // preventing the native focus action and re-focusing with preventScroll.
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  const input = target.closest("input, textarea") as
    | HTMLInputElement
    | HTMLTextAreaElement
    | null;
  if (!input) return;
  if (input.disabled || input.readOnly) return;
  if (document.activeElement === input) return;

  // Only for touch-like pointer interactions (desktop should behave normally).
  if (event.pointerType && event.pointerType !== "touch") return;

  event.preventDefault();
  input.focus({ preventScroll: true });
}

export function AuthLayout({ children }: { children: ReactNode }) {
  const frame = useAuthViewportFrame();

  const frameStyle: CSSProperties = {
    height: frame.height > 0 ? frame.height : "100dvh",
    transform: `translateY(${frame.offsetTop}px)`,
  };

  return (
    <div className="fixed inset-0 overflow-hidden bg-background">
      <div
        className={cn(
          "mx-auto flex w-full max-w-lg flex-col px-4",
          "pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)]",
          AUTH_KEYBOARD_FRAME_TRANSITION_CLASS,
        )}
        style={frameStyle}
      >
        <div
          className="flex min-h-0 flex-1 flex-col justify-center py-8"
          onPointerDownCapture={handleAuthInputPointerDownCapture}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

interface AuthCardProps {
  title: string;
  errorMessage?: string | null;
  header?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  contentClassName?: string;
}

/** Foundation card shell for authentication screens. */
export function AuthCard({
  title,
  errorMessage,
  header,
  children,
  footer,
  className,
  contentClassName,
}: AuthCardProps) {
  return (
    <WidgetCard paddingClass="p-4" className={cn("mx-auto w-full max-w-sm", className)}>
      {header ?? <AuthBrandLogo />}
      <RootPageTitle className="mb-0 mt-4">{title}</RootPageTitle>
      {errorMessage ? (
        <p className="mt-4 text-sm text-destructive" role="alert">
          {errorMessage}
        </p>
      ) : null}
      <div className={cn(ACCOUNT_FORM_SECTION_TITLE_TO_FIELDS_CLASS, contentClassName)}>
        {children}
      </div>
      {footer}
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
    <p className={cn("mt-6 text-center text-sm text-muted-foreground", className)}>
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
