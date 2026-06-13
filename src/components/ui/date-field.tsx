"use client";

import * as React from "react";

import { formatDisplayDate } from "@/lib/format/date";
import { cn } from "@/lib/utils";

import { inputClassName } from "@/components/ui/input";

export interface DateFieldProps
  extends Omit<React.ComponentProps<"input">, "type" | "value" | "onChange"> {
  value: string;
  onChange: (value: string) => void;
  locale?: string;
}

export const DateField = React.forwardRef<HTMLInputElement, DateFieldProps>(
  (
    {
      className,
      value,
      onChange,
      locale = "en-GB",
      disabled,
      id,
      "aria-invalid": ariaInvalid,
      ...props
    },
    ref,
  ) => {
    const nativeRef = React.useRef<HTMLInputElement>(null);

    React.useImperativeHandle(ref, () => nativeRef.current as HTMLInputElement);

    return (
      <div className="relative">
        <div
          aria-hidden="true"
          className={cn(
            inputClassName,
            "flex items-center truncate tabular-nums",
            disabled && "pointer-events-none",
            className,
          )}
        >
          {value ? formatDisplayDate(value, locale) : null}
        </div>
        <input
          {...props}
          ref={nativeRef}
          id={id}
          type="date"
          value={value}
          disabled={disabled}
          aria-invalid={ariaInvalid}
          onChange={(event) => onChange(event.target.value)}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
      </div>
    );
  },
);

DateField.displayName = "DateField";
