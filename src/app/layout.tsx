import type { Metadata, Viewport } from "next";

import { AppProviders } from "@/providers/app-providers";
import { fontVariables, geistSans } from "@/lib/fonts";

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
    icon: [
      { url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
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
            __html: `(function(){try{var t=localStorage.getItem("nume-theme");var d=t==="dark"||(t!=="light"&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d);if(t==="light"||t==="dark"||t==="system"){document.documentElement.dataset.theme=t;}else{document.documentElement.dataset.theme="system";}}catch(e){}})();`,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var p=location.pathname;if(p==="/splash")return;if(sessionStorage.getItem("nume-splash-complete")==="1")return;location.replace("/splash");}catch(e){}})();`,
          }}
        />
      </head>
      <body className="h-dvh overflow-hidden bg-background font-latin text-foreground">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
