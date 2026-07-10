"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { useT } from "@/providers/i18n-provider";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function LandingScreen() {
  const t = useT();
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [installVisible, setInstallVisible] = useState(false);

  useEffect(() => {
    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
      setInstallVisible(true);
    }

    function handleAppInstalled() {
      setInstallPrompt(null);
      setInstallVisible(false);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  async function handleInstall() {
    if (!installPrompt) return;
    await installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
    setInstallVisible(false);
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col bg-background px-6 py-12 text-foreground">
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <Image
          src="/brand-flatten-black.svg"
          alt={t("common.brandName")}
          width={64}
          height={64}
          className="dark:hidden"
          priority
        />
        <Image
          src="/brand-flatten-white.svg"
          alt={t("common.brandName")}
          width={64}
          height={64}
          className="hidden dark:block"
          priority
        />
        <h1 className="mt-6 text-2xl font-semibold tracking-tight">
          {t("common.brandName")}
        </h1>
        <p className="mt-3 max-w-sm text-[0.9375rem] leading-relaxed text-muted-foreground">
          {t("landing.description")}
        </p>
      </div>

      <div className="flex w-full flex-col gap-3">
        <Button className="h-12 w-full" asChild>
          <Link href="/login">{t("landing.login")}</Link>
        </Button>
        <Button className="h-12 w-full" variant="outline" asChild>
          <Link href="/register">{t("landing.register")}</Link>
        </Button>
        {installVisible ? (
          <Button
            className="h-12 w-full"
            variant="secondary"
            type="button"
            onClick={handleInstall}
          >
            {t("landing.installApp")}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
