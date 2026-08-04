"use client";

import { Camera } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";

import { cn } from "@/lib/utils";
import { useT } from "@/providers/i18n-provider";

/** Profile avatar diameter — larger than account-card logos by design. */
export const PROFILE_PHOTO_SIZE_PX = 112;

interface ProfilePhotoFieldProps {
  avatarUrl: string | null;
  disabled?: boolean;
  onSave: (file: File) => Promise<void>;
}

export function ProfilePhotoField({
  avatarUrl,
  disabled = false,
  onSave,
}: ProfilePhotoFieldProps) {
  const t = useT();
  const inputRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [optimisticPreview, setOptimisticPreview] = useState<string | null>(
    null,
  );

  const displayUrl = optimisticPreview ?? avatarUrl;
  const busy = disabled || saving;

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

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        disabled={busy}
        onClick={openPicker}
        aria-label={
          avatarUrl
            ? t("more.profile.photoChange")
            : t("more.profile.photoUpload")
        }
        className={cn(
          "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-muted-foreground transition-opacity",
          busy && "pointer-events-none opacity-60",
        )}
        style={{
          width: PROFILE_PHOTO_SIZE_PX,
          height: PROFILE_PHOTO_SIZE_PX,
        }}
      >
        {displayUrl ? (
          <Image
            key={displayUrl}
            src={displayUrl}
            alt=""
            fill
            unoptimized
            className="object-cover"
          />
        ) : (
          <Camera className="size-10" aria-hidden />
        )}
      </button>

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
    </div>
  );
}
