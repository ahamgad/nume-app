"use client";

import { ChevronLeft, X } from "lucide-react";
import type { ReactNode } from "react";

import { SCREEN_HEADER_ICON_BUTTON_SIZE_CLASS } from "@/lib/layout/screen-spacing";
import { cn } from "@/lib/utils";

interface HeaderIconButtonProps {
  onClick: () => void;
  "aria-label": string;
  icon?: "back" | "close" | ReactNode;
  className?: string;
}

export function HeaderIconButton({
  onClick,
  "aria-label": ariaLabel,
  icon = "back",
  className,
}: HeaderIconButtonProps) {
  const iconNode =
    icon === "back" ? (
      <ChevronLeft className={cn("size-6", "rtl:rotate-180")} />
    ) : icon === "close" ? (
      <X className="size-5" />
    ) : (
      icon
    );

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-muted text-foreground",
        SCREEN_HEADER_ICON_BUTTON_SIZE_CLASS,
        className,
      )}
    >
      {iconNode}
    </button>
  );
}
