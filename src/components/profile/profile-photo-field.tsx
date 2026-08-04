"use client";

import { Camera, Trash2 } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";

import { ConfirmBottomSheet } from "@/components/ui/confirm-bottom-sheet";
import { IconButton } from "@/components/ui/icon-button";
import { CARD_SURFACE_BG_CLASS } from "@/lib/layout/card-surface";
import { cn } from "@/lib/utils";
import { useT } from "@/providers/i18n-provider";

/** Profile avatar diameter — larger than account-card logos by design. */
export const PROFILE_PHOTO_SIZE_PX = 112;

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
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [optimisticPreview, setOptimisticPreview] = useState<string | null>(
    null,
  );
  const [optimisticRemoved, setOptimisticRemoved] = useState(false);

  const displayUrl = optimisticRemoved
    ? null
    : (optimisticPreview ?? avatarUrl);
  const busy = disabled || saving || removing;

  function openPicker() {
    if (busy) return;
    setError(null);
    inputRef.current?.click();
  }

  async function handleFileChange(fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file || busy) return;

    if (!file.type.startsWith("image/")) {
      setError(t("more.profile.photoInvalidType"));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError(t("more.profile.photoTooLarge"));
      return;
    }

    const preview = URL.createObjectURL(file);
    setOptimisticRemoved(false);
    setOptimisticPreview(preview);
    setSaving(true);
    setError(null);

    try {
      await onSave(file);
      setOptimisticPreview((current) => {
        if (current) URL.revokeObjectURL(current);
        return null;
      });
    } catch {
      setOptimisticPreview((current) => {
        if (current) URL.revokeObjectURL(current);
        return null;
      });
      setError(t("more.profile.photoSaveError"));
    } finally {
      setSaving(false);
    }
  }

  async function handleConfirmRemove() {
    if (busy) return;
    setRemoving(true);
    setError(null);
    try {
      await onRemove();
      setOptimisticRemoved(true);
      setOptimisticPreview((current) => {
        if (current) URL.revokeObjectURL(current);
        return null;
      });
      setConfirmOpen(false);
    } catch {
      setError(t("more.profile.photoSaveError"));
      setConfirmOpen(false);
    } finally {
      setRemoving(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="relative shrink-0"
        style={{
          width: PROFILE_PHOTO_SIZE_PX,
          height: PROFILE_PHOTO_SIZE_PX,
        }}
      >
        <button
          type="button"
          disabled={busy}
          onClick={openPicker}
          aria-label={
            displayUrl
              ? t("more.profile.photoChange")
              : t("more.profile.photoUpload")
          }
          className={cn(
            "absolute inset-0 inline-flex items-center justify-center overflow-hidden rounded-full bg-muted text-muted-foreground transition-opacity",
            "[&_img]:pointer-events-none [&_svg]:pointer-events-none",
            busy && "pointer-events-none opacity-60",
          )}
        >
          {displayUrl ? (
            <Image
              key={displayUrl}
              src={displayUrl}
              alt=""
              fill
              unoptimized
              draggable={false}
              className="pointer-events-none object-cover"
            />
          ) : (
            <Camera className="pointer-events-none size-10" aria-hidden />
          )}
        </button>

        {displayUrl ? (
          <IconButton
            type="button"
            variant="ghost"
            size="sm"
            disabled={busy}
            aria-label={t("more.profile.photoRemove")}
            className={cn(
              "absolute bottom-1 end-1 z-10 size-7 text-destructive shadow-sm",
              "hover:bg-card hover:text-destructive",
              CARD_SURFACE_BG_CLASS,
            )}
            onClick={(event) => {
              event.stopPropagation();
              if (busy) return;
              setConfirmOpen(true);
            }}
          >
            <Trash2 className="size-3.5" aria-hidden />
          </IconButton>
        ) : null}
      </div>

      {error ? (
        <p className="text-center text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={(event) => {
          void handleFileChange(event.target.files);
          event.target.value = "";
        }}
      />

      <ConfirmBottomSheet
        open={confirmOpen}
        titleId="profile-photo-remove-title"
        icon="delete"
        title={t("more.profile.photoRemoveConfirm.title")}
        description={t("more.profile.photoRemoveConfirm.description")}
        confirmLabel={t("more.profile.photoRemoveConfirm.confirm")}
        confirmLoadingLabel={t("more.profile.photoRemoveConfirm.removing")}
        cancelLabel={t("more.profile.photoRemoveConfirm.cancel")}
        confirmDisabled={removing}
        onConfirm={() => {
          void handleConfirmRemove();
        }}
        onCancel={() => {
          if (!removing) setConfirmOpen(false);
        }}
      />
    </div>
  );
}
