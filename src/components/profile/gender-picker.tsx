"use client";

import { useMemo, useState } from "react";

import {
  InputField,
  InputFieldRowTrigger,
  InputFieldValue,
} from "@/components/forms/input-field";
import { ImmersiveBottomSheet } from "@/components/ui/immersive-bottom-sheet";
import { PickerList, PickerListNoneOption, PickerListOption } from "@/components/ui/picker-list";
import type { ProfileGender } from "@/lib/profile/types";
import { PROFILE_GENDER_OPTIONS } from "@/lib/profile/types";
import type { TranslationKey } from "@/lib/i18n";
import { useT } from "@/providers/i18n-provider";

interface GenderPickerProps {
  id?: string;
  label: string;
  value: ProfileGender | null;
  disabled?: boolean;
  onSave: (value: ProfileGender | null) => void | Promise<void>;
}

function genderLabel(
  gender: ProfileGender,
  t: ReturnType<typeof useT>,
): string {
  return t(`more.profile.genderOptions.${gender}` as TranslationKey);
}

export function GenderPicker({
  id = "gender",
  label,
  value,
  disabled = false,
  onSave,
}: GenderPickerProps) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<ProfileGender | null>(value);
  const [saving, setSaving] = useState(false);

  const displayLabel = useMemo(() => {
    if (!value) return t("more.profile.genderPlaceholder");
    return genderLabel(value, t);
  }, [t, value]);

  function handleOpen() {
    if (disabled) return;
    setDraft(value);
    setOpen(true);
  }

  async function handleConfirm() {
    if (saving) return;
    setSaving(true);
    try {
      await onSave(draft);
      setOpen(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <InputField id={id} label={label}>
      <InputFieldRowTrigger
        id={id}
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={handleOpen}
        className={disabled ? "pointer-events-none opacity-60" : undefined}
      >
        <InputFieldValue isPlaceholder={!value}>{displayLabel}</InputFieldValue>
      </InputFieldRowTrigger>

      {open ? (
        <ImmersiveBottomSheet
          title={label}
          onDismiss={() => setOpen(false)}
          onConfirm={() => {
            void handleConfirm();
          }}
          confirmDisabled={saving}
          ariaLabel={label}
        >
          <PickerList ariaLabel={label}>
            <PickerListNoneOption
              selected={draft === null}
              onSelect={() => setDraft(null)}
            />
            {PROFILE_GENDER_OPTIONS.map((option) => (
              <PickerListOption
                key={option}
                selected={draft === option}
                onSelect={() => setDraft(option)}
              >
                {genderLabel(option, t)}
              </PickerListOption>
            ))}
          </PickerList>
        </ImmersiveBottomSheet>
      ) : null}
    </InputField>
  );
}
