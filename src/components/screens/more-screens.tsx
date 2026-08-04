"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Info, MessageSquare, Settings, User } from "lucide-react";

import { AccountTypePickerCardRow } from "@/components/accounts/account-type-picker-card";
import {
  RootPageHeader,
  RootPageTitle,
  StackPageHeader,
  StackPageTitle,
} from "@/components/layout/stack-page-chrome";
import { ScreenBody } from "@/components/layout/screen-header";
import { SettingsRadioList } from "@/components/ui/settings-radio-list";
import { requestLocaleRestart } from "@/lib/i18n/locale-restart";
import type { AppLocale } from "@/lib/fonts";
import { ACCOUNT_TYPE_PICKER_CARD_GAP_PX } from "@/lib/layout/account-type-picker-chrome";
import type { ThemePreference } from "@/lib/theme/theme-preference";
import { useT, useTranslations } from "@/providers/i18n-provider";
import { useTheme } from "@/providers/theme-provider";

export function MoreScreen() {
  const t = useT();
  const router = useRouter();

  return (
    <>
      <RootPageHeader title={t("more.title")} />
      <ScreenBody>
        <RootPageTitle>{t("more.title")}</RootPageTitle>
        <div
          className="flex flex-col"
          style={{ gap: ACCOUNT_TYPE_PICKER_CARD_GAP_PX }}
        >
          <AccountTypePickerCardRow
            icon={<User className="size-6" aria-hidden />}
            label={t("more.profile.title")}
            onSelect={() => router.push("/more/profile")}
          />
          <AccountTypePickerCardRow
            icon={<Settings className="size-6" aria-hidden />}
            label={t("more.settings.title")}
          />
          <AccountTypePickerCardRow
            icon={<Info className="size-6" aria-hidden />}
            label={t("more.about.title")}
          />
          <AccountTypePickerCardRow
            icon={<MessageSquare className="size-6" aria-hidden />}
            label={t("more.feedback.title")}
          />
        </div>
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
