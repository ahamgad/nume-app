"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";

import { createTranslator, type TranslationKey } from "@/lib/i18n";

interface I18nContextValue {
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const t = useMemo(() => createTranslator("en"), []);

  const value = useMemo(() => ({ t }), [t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useTranslations() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useTranslations must be used within I18nProvider");
  }
  return context;
}

export function useT() {
  return useTranslations().t;
}
