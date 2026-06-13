import type { AppLocale } from "@/lib/fonts";

export function getIntlLocale(locale: AppLocale): string {
  return locale === "ar" ? "ar-EG" : "en-GB";
}

export function getAmountInputLocale(locale: AppLocale): string {
  return locale === "ar" ? "ar-EG" : "en-US";
}
