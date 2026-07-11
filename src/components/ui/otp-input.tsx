"use client";

import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  type ClipboardEvent,
  type KeyboardEvent,
} from "react";

import { cn } from "@/lib/utils";

const OTP_LENGTH = 6;

function normalizeOtpDigits(value: string, length = OTP_LENGTH) {
  return value.replace(/\D/g, "").slice(0, length);
}

export type OtpInputHandle = {
  focusFirst: () => void;
};

type OtpInputProps = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  length?: number;
  disabled?: boolean;
  readOnly?: boolean;
  "aria-label"?: string;
  className?: string;
};

export const OtpInput = forwardRef<OtpInputHandle, OtpInputProps>(function OtpInput(
  {
    id,
    value,
    onChange,
    length = OTP_LENGTH,
    disabled = false,
    readOnly = false,
    "aria-label": ariaLabel,
    className,
  },
  ref,
) {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const focusFirst = useCallback(() => {
    const input = inputRefs.current[0];
    if (!input || disabled) return;
    input.focus({ preventScroll: true });
    input.select();
  }, [disabled]);

  useImperativeHandle(ref, () => ({ focusFirst }), [focusFirst]);

  const normalized = normalizeOtpDigits(value, length);
  const chars = normalized.split("");
  while (chars.length < length) {
    chars.push("");
  }

  const focusIndex = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(index, length - 1));
      const input = inputRefs.current[clamped];
      if (!input || disabled) return;
      input.focus({ preventScroll: true });
      input.select();
    },
    [disabled, length],
  );

  const applyDigits = useCallback(
    (nextValue: string, focusAt?: number) => {
      if (readOnly || disabled) return;
      const normalized = normalizeOtpDigits(nextValue, length);
      onChange(normalized);
      if (focusAt !== undefined) {
        focusIndex(focusAt);
      }
    },
    [disabled, focusIndex, length, onChange, readOnly],
  );

  function handleChange(index: number, nextRaw: string) {
    const nextDigit = normalizeOtpDigits(nextRaw, 1);
    const current = normalizeOtpDigits(value, length).split("");
    while (current.length < length) {
      current.push("");
    }

    if (nextDigit.length === 0) {
      current[index] = "";
      applyDigits(current.join(""), index);
      return;
    }

    current[index] = nextDigit;
    const joined = current.join("").slice(0, length);
    applyDigits(joined, index < length - 1 ? index + 1 : index);
  }

  function handleKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (readOnly || disabled) return;

    const current = normalizeOtpDigits(value, length);

    if (event.key === "Backspace") {
      event.preventDefault();
      const chars = current.split("");
      while (chars.length < length) {
        chars.push("");
      }

      if (chars[index]) {
        chars[index] = "";
        applyDigits(chars.join(""), index);
        return;
      }

      if (index > 0) {
        chars[index - 1] = "";
        applyDigits(chars.join(""), index - 1);
      }
      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      focusIndex(index - 1);
      return;
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      focusIndex(index + 1);
    }
  }

  function handlePaste(event: ClipboardEvent<HTMLInputElement>) {
    if (readOnly || disabled) return;
    event.preventDefault();
    const pasted = normalizeOtpDigits(event.clipboardData.getData("text"), length);
    if (!pasted) {
      return;
    }
    applyDigits(pasted, Math.min(pasted.length, length - 1));
  }

  return (
    <div
      id={id}
      role="group"
      aria-label={ariaLabel}
      className={cn("grid grid-cols-6 gap-2", className)}
    >
      {Array.from({ length }, (_, index) => (
        <input
          key={index}
          ref={(element) => {
            inputRefs.current[index] = element;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          pattern="[0-9]*"
          maxLength={1}
          value={chars[index] ?? ""}
          disabled={disabled}
          readOnly={readOnly}
          aria-label={
            ariaLabel ? `${ariaLabel} digit ${index + 1} of ${length}` : undefined
          }
          className={cn(
            "box-border h-12 w-full min-w-0 rounded-md border border-input bg-background text-center text-[1.0625rem] font-medium tabular-nums text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 read-only:opacity-100",
          )}
          onChange={(event) => handleChange(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={handlePaste}
          onFocus={(event) => event.currentTarget.select()}
        />
      ))}
    </div>
  );
});

/** Refocus OTP after step transitions while the user gesture is still active. */
export function refocusOtpInput(input: OtpInputHandle | null) {
  if (!input) return;
  queueMicrotask(() => input.focusFirst());
}
