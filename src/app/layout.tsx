import type { Metadata, Viewport } from "next";

import { AppProviders } from "@/providers/app-providers";
import { fontVariables, geistSans } from "@/lib/fonts";
import { getRootBodyHeightClass } from "@/lib/layout/keyboard-snap-investigation";
import { getInstallGateBootstrapScript } from "@/lib/navigation/install-gate-bootstrap";
import { getSplashBootstrapScript } from "@/lib/app/splash-session";
import { cn } from "@/lib/utils";

import "./globals.css";

export const metadata: Metadata = {
  title: "NUME",
  description: "Personal wealth operating system",
  applicationName: "NUME",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "NUME",
  },
  icons: {
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  interactiveWidget: "overlays-content",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#171717" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${fontVariables} ${geistSans.className} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var l=localStorage.getItem("nume-locale");if(l==="ar"){document.documentElement.lang="ar";document.documentElement.dir="rtl";document.documentElement.dataset.locale="ar";}}catch(e){}})();`,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("nume-theme");var d=t==="dark"||(t!=="light"&&window.matchMedia("(prefers-color-scheme: dark)").matches);var r=document.documentElement;r.classList.toggle("dark",d);r.dataset.theme=t==="light"||t==="dark"||t==="system"?t:"system";r.style.colorScheme=d?"dark":"light";r.dataset.themeVersion=String(Date.now());var c=d?"#171717":"#ffffff";var m=document.querySelector('meta[name="theme-color"]:not([media])');if(!m){m=document.createElement("meta");m.setAttribute("name","theme-color");document.head.appendChild(m);}m.setAttribute("content",c);}catch(e){}})();`,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: getInstallGateBootstrapScript(),
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: getSplashBootstrapScript(),
          }}
        />
      </head>
      <body
        className={cn(
          "overflow-hidden bg-background font-latin text-foreground",
          getRootBodyHeightClass(),
        )}
      >
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
