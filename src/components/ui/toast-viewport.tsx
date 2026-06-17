"use client";

import { WifiOff, X } from "lucide-react";

import type { ToastTone } from "@/providers/toast-provider";
import {
  SYSTEM_MESSAGE_INSET_X_CLASS,
  SYSTEM_MESSAGE_TOP_CLASS,
} from "@/lib/layout/screen-spacing";
import { useToast } from "@/providers/toast-provider";
import { useT } from "@/providers/i18n-provider";
import { cn } from "@/lib/utils";

function toastSurfaceClass(tone: ToastTone): string {
  switch (tone) {
    case "warning":
      return "border border-amber-700/50 bg-card text-card-foreground dark:border-amber-300/60";
    case "success":
      return "border border-emerald-700/50 bg-card text-card-foreground dark:border-emerald-300/60";
    default:
      return "border border-border bg-card text-card-foreground";
  }
}

function toastDescriptionClass(tone: ToastTone): string {
  return tone === "default"
    ? "text-muted-foreground"
    : "text-muted-foreground";
}

function toastIconClass(tone: ToastTone): string {
  switch (tone) {
    case "warning":
      return "text-amber-700 dark:text-amber-300";
    case "success":
      return "text-emerald-700 dark:text-emerald-300";
    default:
      return "text-foreground";
  }
}

export function ToastViewport() {
  const { toasts, dismissToast } = useToast();
  const t = useT();

  if (toasts.length === 0) return null;

  return (
    <div
      className={cn(
        "pointer-events-none fixed z-50 flex flex-col gap-1",
        SYSTEM_MESSAGE_INSET_X_CLASS,
        SYSTEM_MESSAGE_TOP_CLASS,
      )}
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "pointer-events-auto flex min-h-11 w-full items-start justify-between gap-3 rounded-none px-4 py-3 text-sm animate-in fade-in slide-in-from-top-2 duration-200",
            toastSurfaceClass(toast.tone),
          )}
          role="status"
        >
          <div className="flex min-w-0 items-start gap-3">
            {toast.icon === "wifi-off" ? (
              <WifiOff
                className={cn(
                  "mt-0.5 size-4 shrink-0",
                  toastIconClass(toast.tone),
                )}
              />
            ) : null}
            <div className="min-w-0">
              <p className="font-medium">{toast.message}</p>
              {toast.description ? (
                <p
                  className={cn(
                    "mt-0.5 text-[0.8125rem] leading-snug",
                    toastDescriptionClass(toast.tone),
                  )}
                >
                  {toast.description}
                </p>
              ) : null}
            </div>
          </div>
          {toast.persistent ? (
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              className="inline-flex size-11 shrink-0 items-center justify-center rounded-none opacity-80 transition-opacity hover:opacity-100"
              aria-label={t("a11y.dismiss")}
            >
              <X className="size-4" />
            </button>
          ) : null}
        </div>
      ))}
    </div>
  );
}
