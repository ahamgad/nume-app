"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { useT } from "@/providers/i18n-provider";

export function AuthLayout({ children }: { children: ReactNode }) {
  const t = useT();
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col bg-background px-4 pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)]">
      <div className="flex flex-1 flex-col justify-center py-8">
        <div className="mb-8 flex justify-center">
          <Image
            src="/brand-flatten-black.svg"
            alt={t("common.brandName")}
            width={40}
            height={40}
            className="dark:hidden"
            priority
          />
          <Image
            src="/brand-flatten-white.svg"
            alt={t("common.brandName")}
            width={40}
            height={40}
            className="hidden dark:block"
            priority
          />
        </div>
        {children}
      </div>
    </div>
  );
}

interface AuthFooterLinkProps {
  prompt: string;
  href: string;
  label: string;
}

export function AuthFooterLink({ prompt, href, label }: AuthFooterLinkProps) {
  return (
    <p className="mt-6 text-center text-sm text-muted-foreground">
      {prompt}{" "}
      <Link href={href} className="font-medium text-foreground underline-offset-4 hover:underline">
        {label}
      </Link>
    </p>
  );
}
