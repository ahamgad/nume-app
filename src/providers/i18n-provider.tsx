"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { createTranslator, type TranslationKey, type Locale } from "@/lib/i18n";
import {
  getLocaleAttributes,
  getLocaleFontClass,
  type AppLocale,
} from "@/lib/fonts";

const LOCALE_STORAGE_KEY = "nume-locale";

interface I18nContextValue {
  locale: AppLocale;
  setLocale: (locale: AppLocale) => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
  fontClass: string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function readStoredLocale(): AppLocale {
  if (typeof window === "undefined") return "en";
  const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
  return stored === "ar" ? "ar" : "en";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<AppLocale>(() => readStoredLocale());

  useEffect(() => {
    const { lang, dir } = getLocaleAttributes(locale);
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    document.documentElement.dataset.locale = locale;
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  }, [locale]);

  const setLocale = useCallback((next: AppLocale) => {
    setLocaleState(next);
  }, []);

  const t = useMemo(() => createTranslator(locale as Locale), [locale]);
  const fontClass = getLocaleFontClass(locale);

  const value = useMemo(
    () => ({ locale, setLocale, t, fontClass }),
    [locale, setLocale, t, fontClass],
  );

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

export function useLocale() {
  return useTranslations().locale;
}

export function useFormatLocale() {
  const locale = useLocale();
  return locale === "ar" ? "ar-EG" : "en-GB";
}
