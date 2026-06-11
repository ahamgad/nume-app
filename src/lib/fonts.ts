import { IBM_Plex_Sans_Arabic } from "next/font/google";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";

export const geistSans = GeistSans;

export const geistMono = GeistMono;

export const ibmPlexSansArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-ibm-plex-arabic",
  display: "swap",
});

export const fontVariables = `${geistSans.variable} ${geistMono.variable} ${ibmPlexSansArabic.variable}`;

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
