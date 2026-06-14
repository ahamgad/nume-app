"use client";

import Image from "next/image";
import { useEffect } from "react";

import { readStoredLocale } from "@/lib/i18n/locale-restart";
import { getLocaleAttributes } from "@/lib/fonts";

const SPLASH_DURATION_MS = 900;

export function SplashScreen() {
  useEffect(() => {
    window.sessionStorage.removeItem("nume-locale-return");

    const locale = readStoredLocale();
    const { lang, dir } = getLocaleAttributes(locale);
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    document.documentElement.dataset.locale = locale;

    const timer = window.setTimeout(() => {
      window.location.replace("/");
    }, SPLASH_DURATION_MS);

    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="flex h-dvh flex-col items-center justify-center bg-background px-6">
      <div className="animate-nume-splash-pulse">
        <Image
          src="/brand-flatten-black.svg"
          alt="NUME"
          width={88}
          height={88}
          priority
          className="dark:hidden"
        />
        <Image
          src="/brand-flatten-white.svg"
          alt="NUME"
          width={88}
          height={88}
          priority
          className="hidden dark:block"
        />
      </div>
    </div>
  );
}
