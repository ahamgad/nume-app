"use client";

import { Camera, User } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";

import { ImmersiveBottomSheet } from "@/components/ui/immersive-bottom-sheet";
import { Button } from "@/components/ui/button";
import { ACCOUNT_CARD_LOGO_SIZE_PX } from "@/lib/layout/account-card-chrome";
import { CARD_SURFACE_CLASS } from "@/lib/layout/card-surface";
import { cn } from "@/lib/utils";
import { useT } from "@/providers/i18n-provider";

interface ProfilePhotoFieldProps {
  avatarUrl: string | null;
  disabled?: boolean;
  onSave: (file: File) => Promise<void>;
  onRemove: () => Promise<void>;
}

export function ProfilePhotoField({
  avatarUrl,
  disabled = false,
  onSave,
  onRemove,
}: ProfilePhotoFieldProps) {
  const t = useT();
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [draftPreview, setDraftPreview] = useState<string | null>(null);
  const [draftFile, setDraftFile] = useState<File | null>(null);
  const [removeRequested, setRemoveRequested] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const displayUrl = draftPreview ?? (removeRequested ? null : avatarUrl);
  const canSave =
    Boolean(draftFile) || (removeRequested && Boolean(avatarUrl));

  function resetDraft() {
    if (draftPreview) URL.revokeObjectURL(draftPreview);
    setDraftPreview(null);
    setDraftFile(null);
    setRemoveRequested(false);
    setError(null);
  }

  function handleOpen() {
    if (disabled) return;
    resetDraft();
    setOpen(true);
  }

  function handlePickFile() {
    inputRef.current?.click();
  }

  function handleFileChange(fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError(t("more.profile.photoInvalidType"));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError(t("more.profile.photoTooLarge"));
      return;
    }

    if (draftPreview) URL.revokeObjectURL(draftPreview);
    setDraftFile(file);
    setDraftPreview(URL.createObjectURL(file));
    setRemoveRequested(false);
    setError(null);
  }

  function handleRemove() {
    if (draftPreview) URL.revokeObjectURL(draftPreview);
    setDraftPreview(null);
    setDraftFile(null);
    setRemoveRequested(true);
    setError(null);
  }

  async function handleConfirm() {
    if (!canSave || saving) return;
    setSaving(true);
    setError(null);
    try {
      if (draftFile) {
        await onSave(draftFile);
      } else if (removeRequested) {
        await onRemove();
      }
      resetDraft();
      setOpen(false);
    } catch {
      setError(t("more.profile.photoSaveError"));
    } finally {
      setSaving(false);
    }
  }

  function handleDismiss() {
    resetDraft();
    setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        onClick={handleOpen}
        className={cn(
          CARD_SURFACE_CLASS,
          "flex w-full items-center gap-3 p-4 text-start transition-colors active:bg-muted",
          disabled && "pointer-events-none opacity-60",
        )}
      >
        <span
          className="relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-muted-foreground"
          style={{
            width: ACCOUNT_CARD_LOGO_SIZE_PX,
            height: ACCOUNT_CARD_LOGO_SIZE_PX,
          }}
        >
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt=""
              fill
              unoptimized
              className="object-cover"
            />
          ) : (
            <User className="size-6" aria-hidden />
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[0.9375rem] font-medium leading-snug">
            {t("more.profile.photo")}
          </span>
          <span className="mt-0.5 block text-[0.8125rem] text-muted-foreground">
            {avatarUrl
              ? t("more.profile.photoChange")
              : t("more.profile.photoUpload")}
          </span>
        </span>
        <Camera className="size-5 shrink-0 text-muted-foreground" aria-hidden />
      </button>

      {open ? (
        <ImmersiveBottomSheet
          title={t("more.profile.photo")}
          onDismiss={handleDismiss}
          onConfirm={() => {
            void handleConfirm();
          }}
          confirmDisabled={!canSave || saving}
          ariaLabel={t("more.profile.photo")}
        >
          <div className="flex flex-col items-center gap-4 px-4 pb-4">
            <span className="relative inline-flex size-16 items-center justify-center overflow-hidden rounded-full bg-muted text-muted-foreground">
              {displayUrl ? (
                <Image
                  src={displayUrl}
                  alt=""
                  fill
                  unoptimized
                  className="object-cover"
                />
              ) : (
                <User className="size-8" aria-hidden />
              )}
            </span>

            <div className="flex w-full flex-col gap-2">
              <Button
                type="button"
                variant="secondary"
                className="h-11 w-full"
                onClick={handlePickFile}
                disabled={saving}
              >
                {displayUrl
                  ? t("more.profile.photoChange")
                  : t("more.profile.photoUpload")}
              </Button>
              {avatarUrl || draftFile ? (
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 w-full"
                  onClick={handleRemove}
                  disabled={saving}
                >
                  {t("more.profile.photoRemove")}
                </Button>
              ) : null}
            </div>

            {error ? (
              <p className="w-full text-sm text-destructive">{error}</p>
            ) : null}

            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={(event) => {
                handleFileChange(event.target.files);
                event.target.value = "";
              }}
            />
          </div>
        </ImmersiveBottomSheet>
      ) : null}
    </>
  );
}
