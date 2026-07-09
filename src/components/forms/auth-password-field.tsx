"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState, type ComponentProps } from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useT } from "@/providers/i18n-provider";

type AuthPasswordFieldProps = Omit<ComponentProps<typeof Input>, "type">;

/** Shared show/hide password field for authentication screens. */
export function AuthPasswordField({ className, ...props }: AuthPasswordFieldProps) {
  const t = useT();
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative">
      <Input
        {...props}
        type={isVisible ? "text" : "password"}
        className={cn("pr-14", className)}
      />
      <button
        type="button"
        className="absolute right-1 top-1/2 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground"
        onClick={() => setIsVisible((value) => !value)}
        aria-label={
          isVisible
            ? t("auth.passwordVisibility.hide")
            : t("auth.passwordVisibility.show")
        }
      >
        {isVisible ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
      </button>
    </div>
  );
}
