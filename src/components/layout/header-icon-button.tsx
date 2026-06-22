"use client";

import { ChevronLeft, X } from "lucide-react";
import type { ReactNode } from "react";

import { SCREEN_HEADER_ICON_CLASS } from "@/components/layout/screen-header";
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
      <ChevronLeft className={cn(SCREEN_HEADER_ICON_CLASS, "rtl:rotate-180")} />
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
        "inline-flex size-11 items-center justify-center rounded-full bg-muted text-foreground",
        className,
      )}
    >
      {iconNode}
    </button>
  );
}
