"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { RootPageTitle } from "@/components/layout/stack-page-chrome";
import { WidgetCard } from "@/components/patterns";
import { ACCOUNT_FORM_SECTION_TITLE_TO_FIELDS_CLASS } from "@/lib/layout/account-form-chrome";
import { cn } from "@/lib/utils";
import { useT } from "@/providers/i18n-provider";

/** 24px — same rhythm as {@link SCREEN_PAGE_TITLE_TO_CONTENT_GAP_CLASS}. */
export const AUTH_PRIMARY_CTA_TOP_CLASS = "mt-6";

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
    <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col bg-background px-4 pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)]">
      <div className="flex flex-1 flex-col justify-center py-8">{children}</div>
    </div>
  );
}

interface AuthCardProps {
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  contentClassName?: string;
}

/** Foundation card shell for authentication screens. */
export function AuthCard({
  title,
  children,
  footer,
  className,
  contentClassName,
}: AuthCardProps) {
  return (
    <WidgetCard paddingClass="p-4" className={cn("mx-auto w-full max-w-sm", className)}>
      <AuthBrandLogo />
      <RootPageTitle className="mb-0 mt-4">{title}</RootPageTitle>
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
