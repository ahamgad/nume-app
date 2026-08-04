"use client";

import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";

import { GenderPicker } from "@/components/profile/gender-picker";
import { ProfilePhotoField } from "@/components/profile/profile-photo-field";
import {
  AccountFormDateField,
  AccountFormEditableField,
  AccountFormSection,
  AccountFormSections,
} from "@/components/forms/account-form-section";
import { AccountFormEditContent } from "@/components/forms/account-form-layout";
import { StackPageHeader, StackPageTitle } from "@/components/layout/stack-page-chrome";
import { ScreenBody } from "@/components/layout/screen-header";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { todayIsoDate } from "@/lib/format/date";
import { ACCOUNT_FORM_SECTION_GAP_PX } from "@/lib/layout/account-form-chrome";
import {
  getProfile,
  removeProfileAvatar,
  updateProfile,
  uploadProfileAvatar,
} from "@/lib/profile/service";
import type { ProfileGender } from "@/lib/profile/types";
import { getSupabaseErrorMessage, logSupabaseError } from "@/lib/supabase/errors";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/providers/auth-provider";
import { useLocale, useT } from "@/providers/i18n-provider";
import { useToast } from "@/providers/toast-provider";

function profileQueryKey(userId: string) {
  return ["profile", userId] as const;
}

export function ProfileScreen() {
  const t = useT();
  const locale = useLocale();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [signingOut, setSigningOut] = useState(false);
  const supabase = useMemo(() => createClient(), []);
  const userId = user?.id;

  const profileQuery = useQuery({
    queryKey: profileQueryKey(userId ?? "anonymous"),
    enabled: Boolean(userId),
    queryFn: async () => {
      if (!userId) throw new Error("Missing user");
      return getProfile(supabase, userId);
    },
  });

  const profile = profileQuery.data;
  const loading = profileQuery.isLoading;
  const loadError = profileQuery.isError;

  const invalidate = useCallback(async () => {
    if (!userId) return;
    await queryClient.invalidateQueries({ queryKey: profileQueryKey(userId) });
  }, [queryClient, userId]);

  const persist = useCallback(
    async (
      task: () => Promise<unknown>,
      successKey:
        | "more.profile.saveSuccess"
        | "more.profile.photoSaveSuccess"
        | "more.profile.photoRemoveSuccess",
    ) => {
      if (!userId) return;
      try {
        await task();
        await invalidate();
        showToast(t(successKey));
      } catch (error) {
        logSupabaseError("updateProfile", error);
        showToast(getSupabaseErrorMessage(error) || t("common.retry"));
        throw error;
      }
    },
    [invalidate, showToast, t, userId],
  );

  async function handleNameSave(value: string) {
    if (!userId) return;
    await persist(
      () => updateProfile(supabase, userId, { fullName: value }),
      "more.profile.saveSuccess",
    );
  }

  async function handleBirthdateSave(value: string) {
    if (!userId) return;
    await persist(
      () => updateProfile(supabase, userId, { birthdate: value }),
      "more.profile.saveSuccess",
    );
  }

  async function handleGenderSave(value: ProfileGender | null) {
    if (!userId) return;
    await persist(
      () => updateProfile(supabase, userId, { gender: value }),
      "more.profile.saveSuccess",
    );
  }

  async function handlePhotoSave(file: File) {
    if (!userId) return;
    await persist(
      () => uploadProfileAvatar(supabase, userId, file),
      "more.profile.photoSaveSuccess",
    );
  }

  async function handlePhotoRemove() {
    if (!userId || !profile) return;
    await persist(
      () => removeProfileAvatar(supabase, userId, profile.avatarPath),
      "more.profile.photoRemoveSuccess",
    );
  }

  async function handleSignOut() {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await signOut();
      router.replace("/continue");
      router.refresh();
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <>
      <StackPageHeader title={t("more.profile.title")} />
      <ScreenBody withTabBar={false}>
        <StackPageTitle>{t("more.profile.title")}</StackPageTitle>

        {loading ? (
          <div
            className="flex flex-col"
            style={{ gap: ACCOUNT_FORM_SECTION_GAP_PX }}
          >
            <Skeleton className="h-20 w-full rounded-2xl" />
            <Skeleton className="h-40 w-full rounded-2xl" />
          </div>
        ) : loadError || !profile ? (
          <div className="space-y-4">
            <p className="text-sm text-destructive">
              {t("more.profile.loadError")}
            </p>
            <Button
              type="button"
              variant="outline"
              className="h-11 w-full"
              onClick={() => void profileQuery.refetch()}
            >
              {t("common.retry")}
            </Button>
          </div>
        ) : (
          <AccountFormEditContent>
            <div
              className="flex flex-col"
              style={{ gap: ACCOUNT_FORM_SECTION_GAP_PX }}
            >
              <ProfilePhotoField
                avatarUrl={profile.avatarUrl}
                onSave={handlePhotoSave}
                onRemove={handlePhotoRemove}
              />

              <AccountFormSections>
                <AccountFormSection title={t("more.profile.detailsSection")}>
                  <AccountFormEditableField
                    id="fullName"
                    label={t("more.profile.name")}
                    value={profile.fullName ?? ""}
                    placeholder={t("more.profile.namePlaceholder")}
                    mode="text"
                    onSave={(value) => {
                      void handleNameSave(value);
                    }}
                  />
                  <AccountFormDateField
                    id="birthdate"
                    label={t("more.profile.birthdate")}
                    value={profile.birthdate ?? ""}
                    placeholder={t("more.profile.birthdatePlaceholder")}
                    locale={locale}
                    maxDate={todayIsoDate()}
                    onChange={(value) => {
                      void handleBirthdateSave(value);
                    }}
                  />
                  <GenderPicker
                    id="gender"
                    label={t("more.profile.gender")}
                    value={profile.gender}
                    onSave={handleGenderSave}
                  />
                </AccountFormSection>
              </AccountFormSections>

              <Button
                type="button"
                variant="outline"
                className="h-11 w-full"
                onClick={() => {
                  void handleSignOut();
                }}
                disabled={signingOut}
              >
                {signingOut ? t("more.profile.signingOut") : t("more.logout")}
              </Button>
            </div>
          </AccountFormEditContent>
        )}
      </ScreenBody>
    </>
  );
}
