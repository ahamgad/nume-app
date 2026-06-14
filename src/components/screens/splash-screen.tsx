"use client";

import Image from "next/image";
import { useEffect } from "react";

import {
  LOCALE_RETURN_PATH_KEY,
  readStoredLocale,
} from "@/lib/i18n/locale-restart";
import { getLocaleAttributes } from "@/lib/fonts";

export function SplashScreen() {
  useEffect(() => {
    const returnPath =
      window.sessionStorage.getItem(LOCALE_RETURN_PATH_KEY) ?? "/";
    window.sessionStorage.removeItem(LOCALE_RETURN_PATH_KEY);

    const locale = readStoredLocale();
    const { lang, dir } = getLocaleAttributes(locale);
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    document.documentElement.dataset.locale = locale;

    const timer = window.setTimeout(() => {
      window.location.replace(returnPath);
    }, 200);

    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="flex h-dvh flex-col items-center justify-center bg-background px-6">
      <Image
        src="/brand-flatten-black.svg"
        alt="NUME"
        width={56}
        height={56}
        priority
        className="dark:hidden"
      />
      <Image
        src="/brand-flatten-white.svg"
        alt="NUME"
        width={56}
        height={56}
        priority
        className="hidden dark:block"
      />
    </div>
  );
}
