"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

import { ScreenBody, ScreenHeader } from "@/components/layout/screen-header";
import { MoreMenuRow } from "@/components/patterns";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { isDevEnvironment } from "@/dev/is-dev-environment";
import { useT, useTranslations } from "@/providers/i18n-provider";
import { useAuth } from "@/providers/auth-provider";
import { cn } from "@/lib/utils";

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

  async function handleLogout() {
    await signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <>
      <ScreenHeader title={t("more.title")} />
      <ScreenBody>
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
      <ScreenHeader mode="stack" title={t("more.profile.title")} />
      <ScreenBody withTabBar={false} className="space-y-4">
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
  return (
    <>
      <ScreenHeader mode="stack" title={t("more.appearance.title")} />
      <ScreenBody withTabBar={false} className="space-y-4">
        <p className="text-[0.9375rem] leading-relaxed text-muted-foreground">
          {t("more.appearance.stub")}
        </p>
        <div className="rounded-lg border border-border px-4 py-3">
          <p className="text-sm font-medium">{t("more.appearance.theme")}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("more.appearance.themeSystem")}
          </p>
        </div>
      </ScreenBody>
    </>
  );
}

function LocaleOption({
  label,
  active,
  onSelect,
}: {
  label: string;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex min-h-11 flex-1 items-center justify-center rounded-md border px-4 py-2 text-sm font-medium transition-colors",
        active
          ? "border-foreground bg-foreground text-background"
          : "border-border bg-background text-foreground",
      )}
    >
      {label}
    </button>
  );
}

export function MoreLanguageScreen() {
  const t = useT();
  const { locale, setLocale } = useTranslations();

  return (
    <>
      <ScreenHeader mode="stack" title={t("more.language.title")} />
      <ScreenBody withTabBar={false} className="space-y-4">
        <p className="text-[0.9375rem] leading-relaxed text-muted-foreground">
          {t("more.language.stub")}
        </p>
        <div className="space-y-3 rounded-lg border border-border p-4">
          <p className="text-sm font-medium">{t("more.language.description")}</p>
          <div className="flex gap-2">
            <LocaleOption
              label={t("more.language.english")}
              active={locale === "en"}
              onSelect={() => setLocale("en")}
            />
            <LocaleOption
              label={t("more.language.arabic")}
              active={locale === "ar"}
              onSelect={() => setLocale("ar")}
            />
          </div>
          <p className="text-[0.8125rem] text-muted-foreground">
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
      <ScreenHeader mode="stack" title={t("more.about.title")} />
      <ScreenBody withTabBar={false}>
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
