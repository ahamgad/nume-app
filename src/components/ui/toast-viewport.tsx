"use client";

import { WifiOff, X } from "lucide-react";

import type { ToastTone } from "@/providers/toast-provider";
import { useToast } from "@/providers/toast-provider";
import { useT } from "@/providers/i18n-provider";
import { cn } from "@/lib/utils";

function toastSurfaceClass(tone: ToastTone): string {
  switch (tone) {
    case "warning":
      return "border border-amber-500/25 bg-amber-500/12 text-foreground";
    case "success":
      return "border border-emerald-500/25 bg-emerald-500/12 text-foreground";
    default:
      return "bg-foreground text-background";
  }
}

export function ToastViewport() {
  const { toasts, dismissToast } = useToast();
  const t = useT();

  if (toasts.length === 0) return null;

  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-x-0 z-50 flex flex-col gap-2 px-4",
        "top-[calc(3.75rem+env(safe-area-inset-top))]",
      )}
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "pointer-events-auto flex min-h-11 items-start justify-between gap-3 rounded-lg px-4 py-3 text-sm shadow-sm animate-in fade-in slide-in-from-top-2 duration-200",
            toastSurfaceClass(toast.tone),
          )}
          role="status"
        >
          <div className="flex min-w-0 items-start gap-3">
            {toast.icon === "wifi-off" ? (
              <WifiOff className="mt-0.5 size-4 shrink-0 text-amber-700 dark:text-amber-300" />
            ) : null}
            <div className="min-w-0">
              <p className="font-medium">{toast.message}</p>
              {toast.description ? (
                <p className="mt-0.5 text-[0.8125rem] leading-snug text-muted-foreground">
                  {toast.description}
                </p>
              ) : null}
            </div>
          </div>
          {toast.persistent ? (
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              className="inline-flex size-11 shrink-0 items-center justify-center rounded-md opacity-80 transition-opacity hover:opacity-100"
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
