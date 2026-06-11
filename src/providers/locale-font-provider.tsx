"use client";

import { useTranslations } from "@/providers/i18n-provider";

export function LocaleFontProvider({ children }: { children: React.ReactNode }) {
  const { fontClass } = useTranslations();

  return <div className={fontClass}>{children}</div>;
}
