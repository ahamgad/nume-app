"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  RootPageHeader,
  RootPageTitle,
  StackPageHeader,
  StackPageTitle,
} from "@/components/layout/stack-page-chrome";
import { ScreenBody, ScreenHeader } from "@/components/layout/screen-header";
import { MoreMenuRow } from "@/components/patterns";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SettingsRadioList } from "@/components/ui/settings-radio-list";
import { isDevEnvironment } from "@/dev/is-dev-environment";
import { requestLocaleRestart } from "@/lib/i18n/locale-restart";
import type { AppLocale } from "@/lib/fonts";
import type { ThemePreference } from "@/lib/theme/theme-preference";
import { useT, useTranslations } from "@/providers/i18n-provider";
import { useAuth } from "@/providers/auth-provider";
import { useTheme } from "@/providers/theme-provider";

const CertificatesQaDevPanel = isDevEnvironment
  ? dynamic(
      () =>
        import("@/dev/certificates-qa-dev-panel").then(
          (module) => module.CertificatesQaDevPanel,
        ),
      { ssr: false },
    )
  : () => null;

export function MoreScreen() {
  const t = useT();
  const router = useRouter();
  const { signOut } = useAuth();
  const [deleting, setDeleting] = useState(false);

  async function handleLogout() {
    await signOut();
    router.replace("/continue");
    router.refresh();
  }

  async function handleDeleteTestAccount() {
    if (deleting) return;
    setDeleting(true);
    try {
      await fetch("/api/qa/delete-test-account", { method: "POST" });
    } finally {
      await signOut();
      router.replace("/continue");
      router.refresh();
      setDeleting(false);
    }
  }

  return (
    <>
      <RootPageHeader title={t("more.title")} />
      <ScreenBody>
        <RootPageTitle>{t("more.title")}</RootPageTitle>
        <Card className="overflow-hidden shadow-none">
          <MoreMenuRow
            title={t("more.profile.title")}
            description={t("more.profile.description")}
            onClick={() => router.push("/more/profile")}
          />
          <div className="mx-4 border-b border-border" />
          <MoreMenuRow
            title={t("more.appearance.title")}
            description={t("more.appearance.description")}
            onClick={() => router.push("/more/appearance")}
          />
          <div className="mx-4 border-b border-border" />
          <MoreMenuRow
            title={t("more.language.title")}
            description={t("more.language.description")}
            onClick={() => router.push("/more/language")}
          />
          <div className="mx-4 border-b border-border" />
          <MoreMenuRow
            title={t("more.about.title")}
            onClick={() => router.push("/more/about")}
          />
        </Card>

        <Button
          variant="outline"
          className="mt-6 h-11 w-full"
          onClick={handleLogout}
        >
          {t("more.logout")}
        </Button>

        {/* Temporary QA tool — remove before production release. */}
        <Button
          variant="outline"
          className="mt-3 h-11 w-full text-destructive hover:text-destructive"
          onClick={handleDeleteTestAccount}
          disabled={deleting}
        >
          {t("more.deleteTestAccount")}
        </Button>

        {isDevEnvironment ? <CertificatesQaDevPanel /> : null}
      </ScreenBody>
    </>
  );
}

export function MoreProfileScreen() {
  const t = useT();
  const { user } = useAuth();
  return (
    <>
      <StackPageHeader title={t("more.profile.title")} />
      <ScreenBody withTabBar={false} className="space-y-4">
        <StackPageTitle>{t("more.profile.title")}</StackPageTitle>
        <div className="rounded-lg border border-border px-4 py-3">
          <p className="text-sm font-medium">{t("more.profile.email")}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {user?.email ?? t("common.emptyValue")}
          </p>
        </div>
        <p className="text-[0.9375rem] leading-relaxed text-muted-foreground">
          {t("more.profile.stub")}
        </p>
      </ScreenBody>
    </>
  );
}

export function MoreAppearanceScreen() {
  const t = useT();
  const { theme, setTheme } = useTheme();

  const themeOptions: { value: ThemePreference; label: string }[] = [
    { value: "system", label: t("more.appearance.themeSystem") },
    { value: "light", label: t("more.appearance.themeLight") },
    { value: "dark", label: t("more.appearance.themeDark") },
  ];

  return (
    <>
      <StackPageHeader title={t("more.appearance.title")} />
      <ScreenBody withTabBar={false} className="space-y-4">
        <StackPageTitle>{t("more.appearance.title")}</StackPageTitle>
        <div className="space-y-3">
          <p className="text-sm font-medium">{t("more.appearance.theme")}</p>
          <SettingsRadioList
            name="theme-preference"
            value={theme}
            options={themeOptions}
            onChange={setTheme}
            ariaLabel={t("more.appearance.theme")}
          />
        </div>
      </ScreenBody>
    </>
  );
}

export function MoreLanguageScreen() {
  const t = useT();
  const { locale } = useTranslations();

  const languageOptions: { value: AppLocale; label: string }[] = [
    { value: "en", label: t("more.language.english") },
    { value: "ar", label: t("more.language.arabic") },
  ];

  function handleLocaleChange(next: AppLocale) {
    if (next === locale) return;
    requestLocaleRestart(next);
  }

  return (
    <>
      <StackPageHeader title={t("more.language.title")} />
      <ScreenBody withTabBar={false} className="space-y-4">
        <StackPageTitle>{t("more.language.title")}</StackPageTitle>
        <div className="space-y-3">
          <p className="text-sm font-medium">{t("more.language.description")}</p>
          <SettingsRadioList
            name="language-preference"
            value={locale}
            options={languageOptions}
            onChange={handleLocaleChange}
            ariaLabel={t("more.language.title")}
          />
          <p className="text-xs text-muted-foreground">
            {t("more.language.previewNote")}
          </p>
        </div>
      </ScreenBody>
    </>
  );
}

export function MoreAboutScreen() {
  const t = useT();
  return (
    <>
      <StackPageHeader title={t("more.about.title")} />
      <ScreenBody withTabBar={false}>
        <StackPageTitle>{t("more.about.title")}</StackPageTitle>
        <div className="flex flex-col items-center py-8 text-center">
          <Image
            src="/brand-flatten-black.svg"
            alt={t("common.brandName")}
            width={48}
            height={48}
            className="dark:hidden"
          />
          <Image
            src="/brand-flatten-white.svg"
            alt={t("common.brandName")}
            width={48}
            height={48}
            className="hidden dark:block"
          />
          <p className="mt-6 max-w-sm text-[0.9375rem] leading-relaxed text-muted-foreground">
            {t("more.about.description")}
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            {t("more.about.version", { version: "0.1.0" })}
          </p>
        </div>
      </ScreenBody>
    </>
  );
}
