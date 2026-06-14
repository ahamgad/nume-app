import { Cairo } from "next/font/google";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";

export const geistSans = GeistSans;

export const geistMono = GeistMono;

export const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cairo",
  display: "swap",
});

export const fontVariables = `${geistSans.variable} ${geistMono.variable} ${cairo.variable}`;

export type AppLocale = "en" | "ar";

export function getLocaleFontClass(locale: AppLocale): string {
  return locale === "ar" ? "font-arabic" : "font-latin";
}

export function getLocaleAttributes(locale: AppLocale) {
  return {
    lang: locale,
    dir: locale === "ar" ? ("rtl" as const) : ("ltr" as const),
  };
}
